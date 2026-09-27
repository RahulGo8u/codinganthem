import type { Metadata } from "next";
import { HomepageClient } from "@/components/HomepageClient";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "CodingAnthem — Free Online Developer Utilities & Tools",
  description:
    "Fast, free developer tools for your browser and AI workflows. Format JSON, encode Base64, generate UUIDs, test regex, and more.",
  alternates: {
    canonical: "https://www.codinganthem.com",
  },
};

const HOMEPAGE_FAQS = [
  {
    question: "Is my data safe when I use these tools?",
    answer:
      "Yes. Most tools run entirely in your browser using JavaScript and the Web Crypto API, so nothing you paste is sent anywhere. A few tools (like URL Shortener) need a backend to work — those are clearly noted on the tool page and only store the minimum data required.",
  },
  {
    question: "Do I need to create an account or sign up?",
    answer: "No. All tools are free to use immediately — no sign-up, no login, no email required.",
  },
  {
    question: "Are the tools actually free, or is there a paid tier?",
    answer: "Completely free, with no paywalls or premium features. CodingAnthem is free forever.",
  },
  {
    question: "How many tools does CodingAnthem offer?",
    answer: `${tools.length} free tools across formatters, encoders, generators, converters, security, images, Web3, AI, and more.`,
  },
  {
    question: "Which tools send my input to a server?",
    answer:
      "URL Shortener stores the destination so the short link can redirect. AI Code Explainer, AI Text-to-SQL, and AI Error Explainer send the text you submit to Google's Gemini API. Every other tool runs in your browser.",
  },
  {
    question: "Does CodingAnthem include Ethereum tools?",
    answer:
      "Yes. Web3 tools convert Wei, Gwei, and Ether, estimate gas, validate EIP-55 address checksums, and calculate Keccak-256 hashes, function selectors, and event topics. They run locally. Never paste a private key or seed phrase into any online tool.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: HOMEPAGE_FAQS.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <HomepageClient faqs={HOMEPAGE_FAQS} />
    </>
  );
}
