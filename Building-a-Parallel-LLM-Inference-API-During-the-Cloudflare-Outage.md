# Building a Parallel LLM Inference API During the Cloudflare Outage

## When Life Gives You Downtime...

Today started like any other Tuesday until Cloudflare decided to take an unexpected nap, bringing down a significant chunk of the internet with it. As services across the web ground to a halt, I found myself with an unexpected gift – uninterrupted time to work on something interesting. My mentor Konark, whom I've known since my college days, had given me an intriguing problem statement a few weeks ago, and today felt like the perfect opportunity to dive deep into it.

## The Challenge: Parallel LLM Inference at Scale

The problem Konark posed was deceptively simple: "How do you run 1000 different prompts across multiple LLM models efficiently, without managing infrastructure?" The real-world use case was clear – imagine you're testing different models for your application, or you need to run the same prompt through multiple models to compare outputs, or you're doing batch inference for a research project. You need something that scales automatically, handles queuing intelligently, and doesn't require you to provision servers or worry about GPU availability.

The requirements were straightforward but challenging: take a JSON file with prompts and their target models, parse it, queue the prompts by model type, run them in parallel across multiple GPU containers, and return results as they complete. Oh, and it should auto-scale based on load and have configurable limits to control costs. Simple, right?

## Enter Modal.com: Serverless Infrastructure for the AI Era

Before diving into the solution, let me talk about Modal – the platform that made this entire project possible. Modal (modal.com) is a serverless compute platform specifically designed for data and AI workloads. Think of it as AWS Lambda, but built from the ground up for machine learning, with native GPU support, container orchestration, and a Python-first API that feels almost magical.

What makes Modal special is how it handles the complexity of running ML workloads. You write Python code, decorate it with Modal's function decorators, and suddenly your local functions become distributed, auto-scaling cloud functions. Need a GPU? Add `gpu="T4"` to your decorator. Want to limit concurrent containers? Add `concurrency_limit=4`. Need persistent storage across invocations? Mount a Modal Volume. It's infrastructure-as-code meets serverless meets ML-ops, all wrapped in a delightfully simple API.

Modal handles the hard parts – container orchestration, GPU scheduling, automatic scaling, cold start optimization, and even model caching. You focus on the logic, Modal handles the infrastructure. For AI workloads, especially LLM inference, this is transformative. No Kubernetes manifests, no Docker registries, no EC2 instances to babysit. Just Python and a declarative way to say "run this on GPUs in the cloud."

## The Solution: Model-Specific Queues and Parallel Processing

The architecture I built leverages Modal's Queue system and GPU containers to create a truly parallel inference pipeline. Here's how it works: when you submit a JSON file with prompts, the API parses it and groups prompts by their target model (llama3.2, phi3, or mistral in my POC). Each model gets its own dedicated Modal Queue – essentially a distributed FIFO queue that persists across container restarts.

The magic happens in the parallelization. For each model type, I created a dedicated Ollama service running in a GPU container. These are long-lived containers (Modal calls them "classes") that start an Ollama server on boot, pull the model once, and then handle inference requests. The `@modal.enter()` decorator runs the initialization code when the container starts, making subsequent inferences blazingly fast since the model is already loaded in GPU memory.

Worker functions continuously poll their respective queues and dispatch inference requests to the appropriate Ollama service. Since Modal allows you to set `concurrency_limit` per function and class, I can precisely control how many GPU containers spin up per model type. Set it to 1 for cost-conscious testing, bump it to 4 for production scale. All three model types run completely in parallel – llama3.2, phi3, and mistral each have their own queue, their own workers, their own GPU containers, all processing simultaneously.

## The Fun Parts: Wrestling with Distributed Systems

Building this was genuinely fun, especially the debugging dance. The first iteration had all prompts going to a single queue, which defeated the purpose of parallel processing. Then I had the "aha moment" – separate queues per model! This meant llama could chew through 334 prompts on its 4 GPU containers while phi and mistral did the same on theirs, all at the same time.

The JSON format was another fun gotcha. I initially had the API expecting a raw array, but FastAPI's Pydantic validation wanted a proper object with a "prompts" key. One quick fix later, and curl was happy. Then came the `'Function' object is not callable` error – I was calling `service.infer(prompt)` instead of `service.infer.remote(prompt)`. Modal's remote execution model requires the `.remote()` suffix for methods on Modal classes. Once I grokked that pattern, everything clicked.

Watching the logs as containers spun up was oddly satisfying. You'd see "🚀 Starting Ollama server on T4 GPU..." followed by model pulls, then the steady stream of "Processing llama3.2: prompt_123" messages. The first run took about 3-4 minutes as each model downloaded (~4GB each), but subsequent runs were instant since Modal caches everything. That's the kind of developer experience that makes you smile.

## Configurability: Making It Actually Useful

One of Konark's implicit requirements was making this practical for different scenarios – testing, development, production, cost-sensitive deployments. I solved this with a simple configuration block at the top of the Modal app:

```python
GPU_CONFIG = {
    "type": "T4",                    # GPU type
    "max_containers_per_model": 1,   # How many GPUs per model
    "idle_timeout": 600              # Keep warm for reuse
}
```

Want to test with minimal cost? Set `max_containers_per_model=1` and use T4 GPUs (~$1.80/hour for all 3 models). Ready for production? Bump it to 4 and switch to A10Gs. Need CPU-only for some reason? Set `type=None`. The entire scaling behavior changes with a few lines of configuration, no code changes required.

This configurability extends to the models themselves. Adding a new model is straightforward – create a new Ollama service class, add a queue for it, wire up a worker function, and you're done. The pattern is consistent across all models, so it's almost copy-paste-modify. I can see this evolving into a more dynamic system where you just list model names in config and the code generates the necessary infrastructure automatically.

## Results: A Working POC

After a few hours of coding and debugging (thank you, Cloudflare outage), I had a working system. Submit a JSON with 10 prompts split across 3 models, and you get results back in about 30-40 seconds (including cold start). Submit 1000 prompts with `max_containers_per_model=4`, and it's done in about 4-5 minutes. The API returns a job ID immediately, you poll for results, and they stream back as they complete. Simple, scalable, and surprisingly cost-effective.

The repo (github.com/aniketmaithani/modal_poc) has everything you need to run this yourself – the Modal app, a Python client, sample JSON files with 10 and 1000 prompts, and a detailed README. It's very much a POC, rough around the edges, but it works and demonstrates the core concepts beautifully.

## What's Next: Turning POC into Library

This is just the beginning. The current implementation is model-specific (hardcoded for llama3.2, phi3, mistral), but it's begging to be generalized. I envision a library where you just pass a config like `{"models": ["llama3.2", "codellama", "mixtral"]}` and it dynamically creates the queues, services, and workers. Add some retry logic, proper error handling, dead letter queues for failed prompts, and you've got something genuinely production-ready.

There's also the monitoring aspect – right now you're flying blind once you submit a job. Adding real-time progress tracking, per-model metrics, cost estimation, and maybe even a simple dashboard would make this much more usable. Modal's built-in observability is good, but custom metrics specific to LLM inference (tokens/sec, model utilization, queue depth over time) would be invaluable.

Another direction is supporting more than just Ollama. What about OpenAI API calls? Anthropic Claude? HuggingFace models? The queue-based architecture is model-agnostic – you just need different service implementations. I could see a plugin system where you register model providers and the framework handles the rest.

## Reflections: The Joy of Building

Working on this today was a reminder of why I love programming. Take an interesting problem, learn a new platform (Modal is genuinely impressive), battle through the inevitable bugs, and emerge with something that actually works. The fact that it happened during a major internet outage just adds to the story. While everyone else was refreshing their dashboards and cursing Cloudflare, I was knee-deep in distributed queues and GPU containers, completely oblivious to the chaos outside my terminal.

Konark's problem statement was simple on the surface but rich with complexity underneath – exactly the kind of challenge that makes you think differently about system design. How do you make parallel processing feel effortless? How do you hide infrastructure complexity without sacrificing control? How do you build something that works for both the hobbyist running 10 prompts and the company running 10,000?

This POC doesn't answer all those questions, but it's a solid start. It proves the concept, validates the architecture, and most importantly, it's fun to use. That last part matters more than people realize – developer experience is a feature. If your tool makes developers smile, you're doing something right.

## Try It Yourself

If you're curious, the code is on GitHub at github.com/aniketmaithani/modal_poc. You'll need a Modal account (they have a generous free tier), and you can have this running in about 5 minutes. The README has everything – setup instructions, configuration options, sample commands. Try it with 10 prompts first, then scale up to 1000. Watch the logs, tweak the GPU config, add your own models. Break it, fix it, make it yours.

Thanks, Konark, for the problem statement. Thanks, Cloudflare, for the downtime. And thanks, Modal, for making distributed GPU computing feel like magic.