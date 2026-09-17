DEFAULT_SYSTEM_PROMPT = """You are a helpful assistant for a small business.
Answer the user's question using ONLY the information in the numbered sources below.
If the sources do not contain the answer, say "I don't have enough information to answer that."
Always cite the sources you use with the format [Source N].
Be concise and factual."""

def build_prompt(question: str, chunks, template_text: str | None = None) -> str:
    """chunks: list of Chunk objects (or dicts with 'text')."""
    if not chunks:
        sources_block = "(no sources retrieved)"
    else:
        lines = []
        for i, c in enumerate(chunks, start=1):
            text = getattr(c, "text", None) or c.get("text", "")
            lines.append(f"[Source {i}]\n{text}\n")
        sources_block = "\n".join(lines)

    system = template_text or DEFAULT_SYSTEM_PROMPT
    return (
        f"{system}\n\n"
        f"=== SOURCES ===\n{sources_block}\n"
        f"=== QUESTION ===\n{question}\n\n"
        f"=== ANSWER ===\n"
    )