# AI Systems Design Research

## Design direction
Rampage should present AI Systems as a guided progression: build the mental model first, then run small experiments, then assemble a reliable system. The interface should show one next action at a time, keep source context close to each lesson, and use progressive disclosure for advanced material.

## Verified sources

| Source | Verified finding | Rampage use |
|---|---|---|
| [Stanford CS 229S](https://cs229s.stanford.edu/fall2024/) | Systems for Machine Learning focuses on performance efficiency and scalability, including efficient training, fine-tuning, inference, Transformer architectures, and LLMs. Public projects include implementing/training Transformers, KV caching, speculative decoding, and a final project. Prerequisites include Python/NumPy, probability, linear algebra/calculus, and ML foundations. | Advanced systems phase and optional “deep dive” modules; do not present as beginner-first. |
| [Stanford CS 329S](https://stanford-cs329s.github.io/) | Real-world ML systems are framed as deployable, reliable, scalable systems. Topics include stakeholders/objectives, data management, data engineering, features, model selection, training, deployment, monitoring, privacy, fairness, and security. The course expects programming and ML foundations and includes a substantial final project. | Production AI Systems phase with a clear prerequisite label and smaller Rampage checkpoints before the full project. |
| [Full Stack Deep Learning](https://fullstackdeeplearning.com/) | Free course material oriented around building and deploying ML-powered products from training through production. | Practical bridge between model basics and full-stack AI product work. |
| [Hugging Face LLM Course](https://huggingface.co/learn/llm-course/en/chapter1/1) | Official open course introducing LLMs and NLP through the Hugging Face ecosystem. | Beginner-friendly LLM branch with runnable notebooks and vocabulary-first lessons. |
| [Google Machine Learning Crash Course](https://developers.google.com/machine-learning/crash-course) | Official introductory modules cover ML fundamentals and an LLM module covering tokens, language modeling, and Transformers. | First on-ramp and prerequisite refresher for learners who need a gentle start. |

## UX decisions

Rampage should distinguish **Start here**, **Build next**, and **Go deeper**. Each learning path should expose estimated time, prerequisites, a short reason for sequencing, and one primary CTA. Resource cards should show source type, difficulty, estimated reading time, and the next course step. Advanced Stanford materials should be labelled as deep work rather than mixed into the beginner flow.

The reader should treat bookmarks, highlights, notes, and last position as private browser state until account sync is added. A compact toolbar is preferable to a dense document-management UI: save position, add bookmark, highlight selected text, and view saved items. A “Continue reading” rail should always return the learner to the last source and location.
