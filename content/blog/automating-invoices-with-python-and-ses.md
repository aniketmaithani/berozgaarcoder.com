---
title: "How I Automated My Invoicing System with Python and AWS SES"
description: "Learn how I built a complete invoice automation system using Python and AWS SES to send automatic emails, track payments, and manage reminders with minimal external libraries."
author: "Aniket Maithani"
date: "November 14, 2025"
datetime: "2025-11-14T10:00:00+05:30"
category: "Automation"
tags:
  - python
  - automation
  - aws
  - ses
  - invoicing
  - productivity
featuredImage: "invoice-automation"
imageAlt: "Python code on a screen showing invoice automation"
published: true
---

There's something deeply satisfying about automating repetitive tasks. For me, sending invoices to clients every month was one of those tasks that ate up more time than it should have. Creating invoices, tracking which ones were sent, following up with reminders, it all felt mechanical and soul-crushing.

So I did what any developer would do: I built a Python system to handle it all automatically. No fancy third-party services, no expensive subscription tools, just Python, AWS SES, and a JSON file to keep track of everything.

In this post, I'll walk you through how I built this system, the challenges I faced, and the lessons I learned along the way. By the end, you'll have a working understanding of how to automate your own invoicing workflow.

## Why Automate Invoicing?

Before diving into the code, let me explain why this was worth the effort. I work with multiple clients, each with different payment terms and schedules. Some pay monthly, others bi-weekly. Keeping track manually meant:

- Setting calendar reminders for each client
- Manually creating invoice PDFs or emails
- Tracking which invoices were sent and which were paid
- Following up with late payments
- Losing sleep over whether I forgot to invoice someone

The automation solved all of this. Now, my system runs daily, checks who needs an invoice, sends it automatically, and reminds clients who haven't paid. I barely think about invoicing anymore.

## The Tech Stack: Keeping It Minimal

I wanted to keep external dependencies to a minimum. Here's what I used:

- **Python 3.9+** for the core logic
- **boto3** (AWS SDK) for interacting with SES
- **JSON files** for storing invoice data and tracking state
- **datetime and timedelta** (built-in) for date calculations
- **smtplib** (built-in) as a fallback option

That's it. No Django, no Flask, no database (initially). Just simple, maintainable Python code.

## Setting Up AWS SES

Amazon Simple Email Service (SES) is perfect for this use case. It's cheap (essentially free for low volumes), reliable, and doesn't require running your own mail server.

### Getting Started with SES

First, I had to set up SES in my AWS account. Here's the process:

1. Go to AWS Console and navigate to SES
2. Verify your sender email address (the one you'll send invoices from)
3. If you're in the SES sandbox, verify recipient emails too
4. Request production access to send to any email address
5. Create an IAM user with SES sending permissions
6. Generate access keys for programmatic access

Once that's done, I stored my AWS credentials securely. I created a `config.py` file that reads from environment variables:

```python
import os

AWS_REGION = os.getenv('AWS_REGION', 'us-east-1')
AWS_ACCESS_KEY = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
SENDER_EMAIL = os.getenv('SENDER_EMAIL', 'invoices@yourdomain.com')

# Invoice settings
INVOICE_DUE_DAYS = 15
REMINDER_DAYS = [7, 3, 1]  # Days before due date to send reminders
```

Never hard-code credentials. I learned this the hard way when I almost committed AWS keys to GitHub once. Use environment variables or AWS secrets manager.

## Building the Invoice Tracker

The heart of the system is a simple JSON file that tracks all clients and their invoice status. I call it `invoices.json`:

```json
{
  "clients": [
    {
      "id": "client_001",
      "name": "Acme Corporation",
      "email": "billing@acme.com",
      "rate": 5000,
      "billing_cycle": "monthly",
      "last_invoice_date": "2025-10-14",
      "next_invoice_date": "2025-11-14",
      "invoices": [
        {
          "invoice_id": "INV-2025-001",
          "date_sent": "2025-10-14",
          "amount": 5000,
          "status": "paid",
          "due_date": "2025-10-29",
          "date_paid": "2025-10-25"
        }
      ]
    },
    {
      "id": "client_002",
      "name": "TechStart Inc",
      "email": "finance@techstart.com",
      "rate": 3500,
      "billing_cycle": "bi-weekly",
      "last_invoice_date": "2025-11-01",
      "next_invoice_date": "2025-11-15",
      "invoices": []
    }
  ]
}
```

This structure gives me everything I need: client details, billing frequency, invoice history, and payment status.

### Loading and Saving Data

I created simple helper functions to work with this data:

```python
import json
from datetime import datetime, timedelta

def load_invoice_data(filepath='invoices.json'):
    """Load invoice data from JSON file."""
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"clients": []}

def save_invoice_data(data, filepath='invoices.json'):
    """Save invoice data to JSON file."""
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)

def get_next_invoice_id():
    """Generate the next invoice ID."""
    data = load_invoice_data()
    year = datetime.now().year

    # Count invoices from current year
    count = sum(1 for client in data['clients']
                for inv in client.get('invoices', [])
                if inv['invoice_id'].startswith(f'INV-{year}'))

    return f'INV-{year}-{count + 1:03d}'
```

The beauty of using JSON is simplicity. No database setup, no migrations, just a text file that's human-readable and easy to backup.

## Creating the Email Content

Now comes the fun part: crafting the actual invoice email. I wanted it to look professional without relying on external templating libraries. Plain HTML with inline CSS does the trick:

```python
def create_invoice_email(client, invoice_id, amount, due_date):
    """Generate HTML email content for invoice."""

    subject = f"Invoice {invoice_id} from BerozgaarCoder"

    html_body = f"""
    <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background-color: #4CAF50; color: white; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; background-color: #f9f9f9; }}
                .invoice-details {{ background-color: white; padding: 15px; margin: 20px 0; border-left: 4px solid #4CAF50; }}
                .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
                .amount {{ font-size: 24px; font-weight: bold; color: #4CAF50; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Invoice</h1>
                </div>
                <div class="content">
                    <p>Dear {client['name']},</p>
                    <p>Thank you for your continued business. Please find your invoice details below:</p>

                    <div class="invoice-details">
                        <p><strong>Invoice Number:</strong> {invoice_id}</p>
                        <p><strong>Date:</strong> {datetime.now().strftime('%B %d, %Y')}</p>
                        <p><strong>Due Date:</strong> {due_date.strftime('%B %d, %Y')}</p>
                        <p><strong>Amount Due:</strong> <span class="amount">${amount:,.2f}</span></p>
                    </div>

                    <p>Please process the payment by the due date. If you have any questions or need any clarification, feel free to reach out.</p>

                    <p>Best regards,<br>Aniket<br>BerozgaarCoder</p>
                </div>
                <div class="footer">
                    <p>This is an automated invoice. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
    </html>
    """

    text_body = f"""
    Invoice {invoice_id}

    Dear {client['name']},

    Thank you for your continued business.

    Invoice Number: {invoice_id}
    Date: {datetime.now().strftime('%B %d, %Y')}
    Due Date: {due_date.strftime('%B %d, %Y')}
    Amount Due: ${amount:,.2f}

    Please process the payment by the due date.

    Best regards,
    Aniket
    BerozgaarCoder
    """

    return subject, html_body, text_body
```

I always include both HTML and plain text versions. Some email clients prefer plain text, and it's good practice for accessibility.

## Sending Emails with AWS SES

Now for the core function that actually sends emails using boto3:

```python
import boto3
from botocore.exceptions import ClientError
import config

def send_email_via_ses(to_email, subject, html_body, text_body):
    """Send email using AWS SES."""

    ses_client = boto3.client(
        'ses',
        region_name=config.AWS_REGION,
        aws_access_key_id=config.AWS_ACCESS_KEY,
        aws_secret_access_key=config.AWS_SECRET_KEY
    )

    try:
        response = ses_client.send_email(
            Source=config.SENDER_EMAIL,
            Destination={
                'ToAddresses': [to_email]
            },
            Message={
                'Subject': {
                    'Data': subject,
                    'Charset': 'UTF-8'
                },
                'Body': {
                    'Text': {
                        'Data': text_body,
                        'Charset': 'UTF-8'
                    },
                    'Html': {
                        'Data': html_body,
                        'Charset': 'UTF-8'
                    }
                }
            }
        )

        print(f"Email sent successfully! Message ID: {response['MessageId']}")
        return True

    except ClientError as e:
        print(f"Error sending email: {e.response['Error']['Message']}")
        return False
```

The boto3 library handles all the heavy lifting. The `send_email` method is straightforward: you specify the sender, recipient, subject, and body (both HTML and text).

### Error Handling

One thing I learned quickly is that email sending can fail for many reasons: invalid addresses, SES quotas, network issues. Always wrap SES calls in try-except blocks and log failures.

## Implementing Auto-Reminders

Sending invoices is only half the battle. Clients sometimes forget to pay (or pretend to forget). That's where automatic reminders come in.

My system checks daily for invoices that are approaching their due date and haven't been paid yet:

```python
def check_and_send_reminders():
    """Check for unpaid invoices and send reminders."""

    data = load_invoice_data()
    today = datetime.now().date()

    for client in data['clients']:
        for invoice in client.get('invoices', []):
            # Skip if already paid
            if invoice.get('status') == 'paid':
                continue

            due_date = datetime.strptime(invoice['due_date'], '%Y-%m-%d').date()
            days_until_due = (due_date - today).days

            # Check if we should send a reminder
            if days_until_due in config.REMINDER_DAYS:
                send_reminder_email(client, invoice, days_until_due)

                # Update last reminder sent
                invoice['last_reminder'] = today.strftime('%Y-%m-%d')
                invoice['reminder_count'] = invoice.get('reminder_count', 0) + 1

    save_invoice_data(data)

def send_reminder_email(client, invoice, days_until_due):
    """Send a payment reminder email."""

    if days_until_due > 0:
        subject = f"Reminder: Invoice {invoice['invoice_id']} due in {days_until_due} days"
        urgency = "friendly"
    else:
        subject = f"Urgent: Invoice {invoice['invoice_id']} is overdue"
        urgency = "urgent"

    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Payment Reminder</h2>
                <p>Dear {client['name']},</p>

                <p>This is a {'friendly' if urgency == 'friendly' else 'urgent'} reminder that invoice
                <strong>{invoice['invoice_id']}</strong> for <strong>${invoice['amount']:,.2f}</strong>
                {'is due in ' + str(days_until_due) + ' days' if days_until_due > 0 else 'is now overdue'}.</p>

                <p>Due Date: <strong>{invoice['due_date']}</strong></p>

                <p>If you have already sent the payment, please disregard this message.
                Otherwise, kindly process the payment at your earliest convenience.</p>

                <p>Thank you for your business!</p>

                <p>Best regards,<br>Aniket</p>
            </div>
        </body>
    </html>
    """

    text_body = f"""
    Payment Reminder

    Dear {client['name']},

    This is a reminder that invoice {invoice['invoice_id']} for ${invoice['amount']:,.2f}
    {'is due in ' + str(days_until_due) + ' days' if days_until_due > 0 else 'is now overdue'}.

    Due Date: {invoice['due_date']}

    If you have already sent the payment, please disregard this message.

    Thank you!
    Aniket
    """

    send_email_via_ses(client['email'], subject, html_body, text_body)
```

The reminder logic is simple but effective. I send reminders at 7 days, 3 days, and 1 day before the due date. The tone gets progressively more urgent as the deadline approaches.

## Conclusion: Freedom Through Automation

Building this invoicing system was one of the best time investments I've made. It took about a weekend to build the initial version and another few hours to refine it, but it has saved me countless hours since.

More importantly, it eliminated the mental overhead of tracking invoices. I no longer worry about forgetting to bill a client or missing a payment. The system handles it all, and I can focus on actual work instead of administrative tasks.

The best part? This approach is extensible. You can adapt it to any kind of recurring notification system: appointment reminders, subscription renewals, report deliveries, whatever you need.

If you're spending more than an hour a month on manual invoicing, you owe it to yourself to automate it. Start simple, iterate, and enjoy the freedom that comes from letting code handle the boring stuff.

Have questions about the implementation? Want to see the full code? Drop me a message or check out the [GitHub repository](https://github.com/yourusername/invoice-automation) where I've shared the complete working example.

Now, if you'll excuse me, I have some actual coding to do instead of sending invoices. That's the dream, isn't it?
