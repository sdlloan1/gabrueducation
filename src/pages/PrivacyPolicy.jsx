import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import LegalLayout, { Section } from "@/components/content/LegalLayout";

export default function PrivacyPolicy() {
  return (
    <>
      <Seo
        title="Privacy Policy — Gabru Education"
        description="How Gabru Education collects, uses and protects your data: account details, order information, UPI payment screenshots, cookies and your rights under Indian data protection law."
        keywords={["Gabru Education privacy policy", "data protection India", "digital store privacy"]}
        path="/privacy-policy"
      />
      <LegalLayout
        title="Privacy policy"
        subtitle="What we collect, why we collect it, and the control you have over it."
        updated="13 November 2026"
      >
        <Section heading="1. Who we are">
          <p>
            Gabru Education is a digital products store operated from India. This policy explains how we
            handle personal data when you browse the store, create an account, place an order or contact us.
            You can reach us any time from the <Link to="/contact" className="font-semibold text-primary underline">contact page</Link>.
          </p>
        </Section>

        <Section heading="2. Information we collect">
          <ul className="list-disc space-y-1 pl-5">
            <li>Account details: your name, email address and login credentials when you register.</li>
            <li>Order details: items purchased, amounts in INR, and the name, mobile number and email you enter at checkout.</li>
            <li>Payment proof: the UPI screenshot you upload so we can verify the payment. We never ask for your UPI PIN, card number or bank password.</li>
            <li>Content you send us: reviews, ratings, photos, saved items and messages from the contact form.</li>
            <li>Technical data: device type, browser, approximate location and pages visited, collected to keep the store secure and working.</li>
          </ul>
        </Section>

        <Section heading="3. How we use your information">
          <ul className="list-disc space-y-1 pl-5">
            <li>To create and secure your account and deliver the products you bought.</li>
            <li>To verify UPI payments, approve orders and email your download links.</li>
            <li>To answer support questions and handle refund requests.</li>
            <li>To show reviews and ratings on product pages.</li>
            <li>To improve the catalogue, pricing and site performance, and to prevent fraud and abuse.</li>
          </ul>
        </Section>

        <Section heading="4. Cookies and local storage">
          <p>
            We use cookies and browser storage to keep you signed in, remember your cart and understand
            which pages are used most. You can clear or block them in your browser settings; the cart and
            sign-in may then stop working.
          </p>
        </Section>

        <Section heading="5. Sharing">
          <p>
            We do not sell your personal data. We share only what is needed with the services that run the
            store — hosting, database and email delivery — and with authorities where the law requires it.
            Payment screenshots are visible only to our order-verification team.
          </p>
        </Section>

        <Section heading="6. Security and retention">
          <p>
            Files and messages are stored on access-controlled services, and payment screenshots are kept
            private. We retain order records while your lifetime access is active and for as long as tax and
            accounting rules require; you can ask us to delete account data that we are not legally required
            to keep.
          </p>
        </Section>

        <Section heading="7. Your rights">
          <p>
            You can ask for a copy of your data, correct it, delete it, or withdraw consent for
            non-essential cookies by writing to us from the contact page. We respond to verified requests
            within 30 days.
          </p>
        </Section>

        <Section heading="8. Children">
          <p>
            The store is meant for buyers aged 18 and above. If a minor has shared data with us, contact us
            and we will delete it.
          </p>
        </Section>

        <Section heading="9. Changes">
          <p>
            We may update this policy as the store changes. The date at the top always shows the current
            version, and material changes are announced on the site.
          </p>
        </Section>
      </LegalLayout>
    </>
  );
}