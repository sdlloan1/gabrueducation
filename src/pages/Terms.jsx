import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import LegalLayout, { Section } from "@/components/content/LegalLayout";

export default function Terms() {
  return (
    <>
      <Seo
        title="Terms of Service — Gabru Education"
        description="The terms that apply when you buy website templates, code files, AI prompts, courses or app development from Gabru Education: licence, UPI payments, delivery, refunds and liability."
        keywords={["Gabru Education terms", "digital product licence India", "template usage terms"]}
        path="/terms"
      />
      <LegalLayout
        title="Terms of service"
        subtitle="The rules that apply when you browse or buy from Gabru Education."
        updated="13 November 2026"
      >
        <Section heading="1. Accepting these terms">
          <p>
            By using this store, creating an account or placing an order you accept these terms. If you do
            not agree, please do not use the site.
          </p>
        </Section>

        <Section heading="2. Digital products and licence">
          <p>
            Everything sold here is digital: templates, code files, AI prompts, courses, software tools,
            e-books and development services. Each purchase grants you a non-exclusive, non-transferable
            licence to use the product for one end product — your own or a client's — for life.
          </p>
          <p>
            You may not resell, redistribute, sublicense or republish the product as a template, code pack
            or prompt pack of your own, and you may not upload it to marketplaces or file-sharing sites.
          </p>
        </Section>

        <Section heading="3. Pricing and payment">
          <p>
            All prices are in Indian Rupees (INR) and include applicable taxes unless stated otherwise.
            Checkout is by UPI; you pay, upload the payment screenshot and our team verifies it manually.
          </p>
          <p>
            Hire developer orders are billed as 50% at checkout with the balance due after your site goes
            live. App development orders are billed at the price shown on the product page. Orders that fail
            verification are rejected with a reason and no access is granted.
          </p>
        </Section>

        <Section heading="4. Delivery and access">
          <p>
            Access unlocks in My Library once payment is approved, and the download links are emailed to the
            address on the order. Access is lifetime for the option you bought — the prompt option does not
            include source code.
          </p>
        </Section>

        <Section heading="5. Refunds">
          <p>
            Because products are delivered instantly, orders are non-refundable by default. Any refund
            window that applies is shown on the product page and in the{" "}
            <Link to="/refund-policy" className="font-semibold text-primary underline">refund policy</Link>.
          </p>
        </Section>

        <Section heading="6. Your responsibilities">
          <ul className="list-disc space-y-1 pl-5">
            <li>Keep your login details safe and do not share downloads.</li>
            <li>Use products lawfully and do not remove licence notices from code files.</li>
            <li>Make sure the content and branding you add to a template is yours or properly licensed.</li>
            <li>Do not attempt to break, scrape or overload the store.</li>
          </ul>
        </Section>

        <Section heading="7. Development services">
          <p>
            Custom development is delivered on the scope agreed before the order. Timelines depend on you
            providing content, access and feedback. Third-party costs such as domains, hosting or paid APIs
            are not included unless stated in the product page.
          </p>
        </Section>

        <Section heading="8. Availability and changes">
          <p>
            We may update, reprice or retire products at any time. The catalogue can be offline briefly for
            maintenance, and we may suspend accounts that abuse the store or attempt fraud.
          </p>
        </Section>

        <Section heading="9. Limitation of liability">
          <p>
            Products are provided “as is”. To the extent permitted by law, our total liability for any claim
            is limited to the amount you paid for the product concerned. We are not liable for lost profit,
            lost data or third-party platform changes.
          </p>
        </Section>

        <Section heading="10. Governing law">
          <p>
            These terms are governed by the laws of India, and disputes are subject to the jurisdiction of
            Indian courts. Questions? Reach us through the{" "}
            <Link to="/contact" className="font-semibold text-primary underline">contact page</Link>.
          </p>
        </Section>
      </LegalLayout>
    </>
  );
}