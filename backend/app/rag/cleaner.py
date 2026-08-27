import re
import unicodedata


class TextCleaner:
    """Cleans and normalizes extracted text from college documents."""

    @staticmethod
    def clean(text: str) -> str:
        if not text:
            return ""

        # Normalize unicode characters (NFKC)
        text = unicodedata.normalize("NFKC", text)

        # Replace non-breaking spaces and unusual whitespace
        text = text.replace("\u00a0", " ").replace("\r\n", "\n").replace("\r", "\n")

        # Clean trailing and leading spaces from each line
        lines = [line.strip() for line in text.split("\n")]

        # Remove consecutive blank lines
        cleaned_lines = []
        consecutive_empty = 0
        for line in lines:
            if not line:
                consecutive_empty += 1
                if consecutive_empty <= 1:
                    cleaned_lines.append("")
            else:
                consecutive_empty = 0
                cleaned_lines.append(line)

        cleaned_text = "\n".join(cleaned_lines)

        # Normalize multiple horizontal spaces into single space
        cleaned_text = re.sub(r"[ \t]{2,}", " ", cleaned_text)

        return cleaned_text.strip()
