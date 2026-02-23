import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BookOpen, Layers, Search, Thermometer, Hash, ArrowUpDown, Shuffle } from "lucide-react";

const sections = [
  {
    icon: Layers,
    title: "What is Chunking and Why Does Chunk Size Matter?",
    content: `When you feed documents like the FCA Handbook into a RAG system, you can't pass the entire text to the model at once — it would exceed context limits and dilute the relevant information. Instead, the text is split into smaller pieces called "chunks".

Chunk size is one of the most impactful parameters in a RAG pipeline. **Smaller chunks** (100–300 tokens) are more precise — they isolate specific rules like PRIN 2.1.6R on treating customers fairly — but may lose surrounding context. **Larger chunks** (800–2000 tokens) preserve more context, keeping related provisions together, but may include irrelevant information that dilutes the model's focus.

For the FCA Handbook, paragraph-based or recursive chunking at 400–600 tokens tends to work well because the Handbook is already structured into discrete rules, guidance notes, and evidential provisions. Each section (like "SYSC 6.3 — Financial crime") is a natural unit of meaning. The chunking strategy you choose — fixed, sentence, paragraph, or recursive — determines how these boundaries are respected.`,
  },
  {
    icon: Search,
    title: "What Are Embeddings and How Do Different Models Compare?",
    content: `Embeddings are numerical representations of text that capture semantic meaning. When you ask "What are the AML requirements?", the embedding model converts this into a vector (a list of numbers) that sits close to vectors of text about anti-money laundering, even if the exact words differ.

OpenAI offers several embedding models. **text-embedding-3-small** (1536 dimensions) is fast, cheap, and sufficient for most use cases. **text-embedding-3-large** (3072 dimensions) captures more nuance — useful when distinguishing between similar regulatory concepts like "suitability" vs "appropriateness" under COBS. **text-embedding-ada-002** is the older model, still capable but generally outperformed by the v3 models.

The choice matters for financial regulation because regulatory language is precise and domain-specific. A model that better captures the distinction between "must" (a rule, denoted R) and "should" (guidance, denoted G) in FCA text will retrieve more relevant chunks. In practice, text-embedding-3-small offers the best balance of cost and quality for most FCA Handbook queries.`,
  },
  {
    icon: Thermometer,
    title: "What Does Temperature Actually Do?",
    content: `Temperature controls the randomness of the model's output. At **temperature 0**, the model always picks the most probable next token — producing deterministic, focused responses. At **temperature 2.0**, the distribution is flattened, making less probable tokens more likely to be chosen — producing creative but potentially inconsistent output.

For regulatory Q&A, **low temperature (0.1–0.4)** is almost always better. When someone asks about the FCA Principles for Businesses, you want the model to reliably cite PRIN 2.1.1R through 2.1.12R without hallucinating a "Principle 13". Higher temperatures increase the risk of the model fabricating section references or misquoting rules.

There's a sweet spot: **temperature 0.2–0.3** gives the model enough flexibility to synthesise information from multiple chunks into a natural-sounding answer while staying grounded in the retrieved context. Setting it to exactly 0 can occasionally produce repetitive or stilted responses, so a small amount of randomness helps with readability.`,
  },
  {
    icon: Hash,
    title: "What is Top-K Retrieval and How Does Similarity Threshold Work?",
    content: `**Top-K** determines how many chunks are retrieved from the vector database. If K=5, the five most similar chunks to your query are selected and passed to the generation model as context. If K=20, you get more context but risk including irrelevant passages that confuse the model.

The **similarity threshold** is a quality gate. Even within the top-K results, chunks with a similarity score below the threshold are filtered out. A threshold of 0.7 means only chunks that are at least 70% similar to the query are kept. This prevents the model from receiving context that happened to be the "least dissimilar" but isn't actually relevant.

For the FCA Handbook, **K=5 with a threshold of 0.65–0.75** works well for most queries. Broad questions like "What are the Principles?" benefit from higher K (10–15) to capture all 12 principles. Narrow questions like "What is the time limit for FOS referral?" need lower K (2–3) to avoid dilution. The threshold should be lower for broad questions and higher for precise ones.`,
  },
  {
    icon: ArrowUpDown,
    title: "What is Reranking and When Should You Use It?",
    content: `Reranking is a second pass over retrieved chunks using a more sophisticated model to re-order them by relevance. The initial retrieval (vector similarity) is fast but approximate — it finds chunks that are semantically similar to the query. A reranker evaluates each chunk more carefully in the context of the specific question.

Consider a query about "consumer duty obligations for insurance products". Vector search might retrieve chunks about the Consumer Duty (PRIN 2A), insurance conduct rules (ICOBS), and general principles — all relevant but not equally so. A reranker can assess that the ICOBS-specific chunks combined with Consumer Duty provisions are most directly relevant, pushing generic PRIN text lower.

**When to use it:** Reranking adds latency and cost (an additional LLM call) but improves precision when the initial retrieval returns borderline-relevant results. For the FCA Handbook, it's most valuable for cross-sourcebook questions where multiple areas of regulation overlap — like asking about financial crime controls, which spans SYSC 6.3, FCG 3, and the Money Laundering Regulations.`,
  },
  {
    icon: Shuffle,
    title: "What is MMR and When Is It Better Than Cosine Similarity?",
    content: `**Maximal Marginal Relevance (MMR)** is a retrieval method that balances relevance with diversity. Standard cosine similarity retrieves the K most similar chunks to the query — but these chunks might all cover the same aspect of the answer, leading to redundant context.

MMR works iteratively: it selects the first chunk by pure relevance, then for each subsequent chunk, it considers both similarity to the query AND dissimilarity to already-selected chunks. The lambda parameter (typically 0.7) controls this trade-off — higher lambda favours relevance, lower lambda favours diversity.

For the FCA Handbook, MMR shines with broad questions. If you ask "What are the key conduct of business rules?", cosine similarity might return five chunks all from COBS 2 about the overarching duty. MMR would instead select chunks from COBS 2 (general duty), COBS 9 (suitability), COBS 11 (best execution), COBS 4 (communications), and COBS 2.3 (inducements) — giving the model a comprehensive view to synthesise a better answer. Use MMR for exploratory questions; use cosine for precise lookups.`,
  },
];

export default function LearnPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-emerald-400" />
            <h1 className="text-3xl font-bold">Learn RAG</h1>
          </div>
          <p className="text-muted-foreground mb-10 max-w-xl">
            Understanding how each parameter affects your RAG pipeline, with practical examples
            from the FCA Handbook.
          </p>

          <div className="space-y-10">
            {sections.map((section, i) => (
              <article key={i} className="border border-border rounded-lg p-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="h-8 w-8 rounded-md bg-emerald-500/10 flex items-center justify-center">
                    <section.icon className="h-4 w-4 text-emerald-400" />
                  </div>
                  <h2 className="text-lg font-semibold">{section.title}</h2>
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                  {section.content.split("\n\n").map((para, j) => (
                    <p key={j} dangerouslySetInnerHTML={{
                      __html: para
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>')
                    }} />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
