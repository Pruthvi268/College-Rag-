from typing import List, Dict, Any

SYSTEM_INSTRUCTION = """You are the official College Information Assistant (CollegeRAG).
Your duty is to answer the student's question using ONLY the provided official college knowledge base context.

CRITICAL RULES:
1. Grounding: Answer strictly using facts and guidelines explicitly mentioned in the CONTEXT.
2. No Hallucinations: Do not assume, extrapolate, or invent college policies, fee amounts, deadlines, cutoffs, or faculty details.
3. Unknown Information: If the context does not contain the answer, or only partially contains it, clearly and politely inform the student that this information is not available in the official college records and advise them to contact the administration or respective department.
4. Professional & Helpful Tone: Be clear, well-structured, polite, and student-centric. Format responses using Markdown (bullet points, bold text for key dates/figures) for high readability.
5. Citations: When referencing a rule, fee, or date, explicitly mention the source document and page number as noted in the context."""


def build_rag_prompt(
    question: str,
    context_chunks: List[Dict[str, Any]],
    conversation_history: List[Dict[str, str]] = None
) -> str:
    """Constructs the prompt for Gemini with structured context, history, and student question."""
    
    # 1. Format Context Chunks
    if context_chunks:
        formatted_chunks = []
        for i, chunk in enumerate(context_chunks, 1):
            doc_name = chunk.get("filename") or chunk.get("title", "Official Document")
            page = chunk.get("page_number", 1)
            cat = chunk.get("category", "General")
            text = chunk.get("content", "").strip()
            
            formatted_chunks.append(
                f"[Source {i}: {doc_name} | Page: {page} | Category: {cat}]\n{text}"
            )
        context_str = "\n\n".join(formatted_chunks)
    else:
        context_str = "No relevant official college documents found."

    # 2. Format Conversation History (last N messages)
    history_str = ""
    if conversation_history:
        history_lines = []
        for msg in conversation_history[-6:]:
            role = "Student" if msg.get("role") in ["user", "student"] else "CollegeRAG"
            history_lines.append(f"{role}: {msg.get('content', '')}")
        history_str = "CONVERSATION HISTORY:\n" + "\n".join(history_lines) + "\n\n"

    # 3. Assemble Full Prompt
    prompt = f"""{SYSTEM_INSTRUCTION}

{history_str}OFFICIAL COLLEGE KNOWLEDGE BASE CONTEXT:
==================================================
{context_str}
==================================================

STUDENT QUESTION:
{question}

Provide a comprehensive, accurate, and grounded answer below:"""
    return prompt
