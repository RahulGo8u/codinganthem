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
    answer: `${tools.length} tools across formatters, encoders, generators, converters, security, and more — all free, all instant.`,
  },
  {
    question: "Can I use CodingAnthem alongside AI tools like ChatGPT or GitHub Copilot?",
    answer:
      "Yes. Paste JSON, JWTs, SQL, or any AI-generated output directly into a tool to validate, format, or convert it — most tools process everything locally in your browser.",
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
