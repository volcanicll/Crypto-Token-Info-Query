"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "What blockchains are supported?",
      answer:
        "Currently, we support Solana (SOL) and Base (BASE) blockchains. More chains will be added in future updates.",
    },
    {
      question: "What's the difference between Basic Info and AI Analysis?",
      answer:
        "Basic Info provides token metrics such as total holders, trading volume, and whale wallet analysis. AI Analysis uses our advanced AI model to analyze Twitter discussions and sentiment about the token, providing insights about narratives and potential risks.",
    },
    {
      question: "How is the AI Analysis generated?",
      answer:
        "We analyze both the official Twitter account (if available) and mentions of the token across Twitter. Our AI model processes this data to extract key insights, trends, and potential risk factors while filtering out noise and promotional content.",
    },
    {
      question: "How accurate is the Basic Info analysis?",
      answer:
        "Basic Info is pulled directly from blockchain data and provides accurate, real-time metrics about the token. However, due to the nature of blockchain networks, some data might have a small delay in updating.",
    },
    {
      question: "How often is the information updated?",
      answer:
        "Basic Info is fetched in real-time when you make a query. AI Analysis processes the most recent Twitter data available at the time of the query. We recommend running new analyses periodically for the most current insights.",
    },
    {
      question: "Why do I need an access code?",
      answer:
        "The access code helps us maintain service quality and prevent abuse by limiting access to authorized users only. This ensures reliable performance and accurate analysis for all users.",
    },
    {
      question: "Are the analysis results guaranteed to be accurate?",
      answer:
        "While we strive for accuracy in both Basic Info and AI Analysis, the cryptocurrency market is highly volatile and complex. Basic Info provides factual metrics, but AI Analysis involves interpretation of social data and should be used as one of many research tools. Always conduct your own additional research before making any decisions.",
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
      {faqs.map((faq, index) => (
        <div key={index} className="border rounded-lg overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 flex justify-between items-center"
          >
            <span className="font-medium">{faq.question}</span>
            <span className="ml-4 transition-transform duration-200">
              {openIndex === index ? "−" : "+"}
            </span>
          </button>
          {openIndex === index && (
            <div className="px-6 py-4 bg-gray-50">
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
