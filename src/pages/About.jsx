import { Link } from "react-router-dom";
import { BookOpen, Code2, GraduationCap, Layers, ShieldCheck, Sparkles } from "lucide-react";
import Seo from "@/components/Seo";
import LegalLayout, { Section } from "@/components/content/LegalLayout";
import { BRAND } from "@/lib/assets";

const CATEGORIES = [
  { Icon: Layers, title: "Website & app templates", text: "Ready-to-launch storefronts, portfolios, dashboards and mobile app UI kits." },
  { Icon: Code2, title: "Complete code & prompts", text: "Full source code and long-form AI prompts you can paste into any AI builder." },
  { Icon: GraduationCap, title: "Courses & e-books", text: "Practical guides on SEO, building digital products and selling online in India." },
  { Icon: BookOpen, title: "Software tools", text: "Utilities that speed up content, SEO and product research work." },
];

export default function About() {
  return (
    <>
      <Seo
        title="About Gabru Education — Digital Products Store in India"
        description="Gabru Education is an Indian digital marketplace for website templates, AI prompt packs, complete code files, courses, software tools and PDF books, with lifetime access after UPI payment approval."
        keywords={["about Gabru Education", "digital products India", "website templates India", "AI prompt packs", "buy code files"]}
        path="/about"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About Gabru Education",
          url: `${BRAND.siteUrl}/about`,
          mainEntity: {
            "@type": "Organization",
            name: BRAND.name,
            url: BRAND.siteUrl,
            logo: BRAND.logo,
            description: "Digital marketplace for website templates, AI prompt packs, code files, courses and software tools.",
            email: "gabrueducation@gmail.com",
            areaServed: "IN",
          },
        }}
      />
      <LegalLayout
        title="About Gabru Education"
        subtitle="A small Indian studio that packages the work we build every day — templates, code, prompts and guides — into products anyone can launch with."
      >
        <Section heading="What we do">
          <p>
            Gabru Education is a digital products store. We build website and app templates, complete
            code bases, AI prompt packs, courses, software tools and PDF books, then publish them with
            clear pricing in Indian Rupees so you can start a project in hours instead of weeks.
          </p>
          <p>
            Every product page shows exactly what you get, the full feature list and a free preview of
            the prompt or description before you pay.
          </p>
        </Section>

        <Section heading="What you can buy">
          <ul className="mt-1 space-y-3">
            {CATEGORIES.map(({ Icon, title, text }) => (
              <li key={title} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[12.5px] font-bold text-foreground">{title}</span>
                  <span className="block text-[12px] leading-relaxed">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section heading="How buying works">
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>Pick a product and the option you need — prompt only, complete code, hire a developer or full app development.</li>
            <li>Pay by UPI and upload your payment screenshot at checkout.</li>
            <li>We verify the payment, then your files unlock in My Library and land in your inbox — for life.</li>
          </ol>
        </Section>

        <Section heading="Why buyers choose us">
          <p className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            Transparent pricing, manual payment verification, real support on WhatsApp, and a licence
            that lets you ship one end product for yourself or a client.
          </p>
          <p className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            Need something custom? Choose Hire developer or App development on any product page and we
            build it with you.
          </p>
        </Section>

        <Section heading="Talk to us">
          <p>
            Questions before you buy? Visit the <Link to="/contact" className="font-semibold text-primary underline">contact page</Link>,
            read the <Link to="/faq" className="font-semibold text-primary underline">FAQ</Link> or message
            us on WhatsApp. We reply on working days.
          </p>
        </Section>
      </LegalLayout>
    </>
  );
}