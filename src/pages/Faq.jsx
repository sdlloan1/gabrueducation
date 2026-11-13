import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import LegalLayout from "@/components/content/LegalLayout";
import FaqAccordion from "@/components/content/FaqAccordion";
import { FAQS, faqJsonLd } from "@/data/faqs";

export default function Faq() {
  return (
    <>
      <Seo
        title="FAQ — Gabru Education Templates, Prompts & Payments"
        description="Answers about buying website templates, AI prompts and code files on Gabru Education: UPI payments, approval time, file delivery, licensing, refunds and support."
        keywords={["Gabru Education FAQ", "how to buy website template India", "UPI payment approval", "digital product licence", "template refund policy"]}
        path="/faq"
        jsonLd={faqJsonLd()}
      />
      <LegalLayout
        title="Frequently asked questions"
        subtitle="Everything about payments, delivery, licensing and support at Gabru Education."
      >
        <FaqAccordion faqs={FAQS} className="border-0 px-0 shadow-none" />
        <p className="text-[12.5px] leading-relaxed text-slate-600">
          Still stuck? Visit the <Link to="/contact" className="font-semibold text-primary underline">contact page</Link>{" "}
          or read the <Link to="/refund-policy" className="font-semibold text-primary underline">refund policy</Link>.
        </p>
      </LegalLayout>
    </>
  );
}