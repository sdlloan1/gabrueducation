import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export default function FaqAccordion({ faqs, className }) {
  return (
    <Accordion
      type="single"
      collapsible
      className={cn("rounded-2xl border border-border bg-white px-3.5 clay", className)}
    >
      {faqs.map((faq) => (
        <AccordionItem key={faq.q} value={faq.q} className="border-b border-border/70 last:border-0">
          <AccordionTrigger className="py-3 text-left text-[13px] font-bold leading-snug text-foreground hover:no-underline">
            {faq.q}
          </AccordionTrigger>
          <AccordionContent className="pb-3 text-[12.5px] leading-relaxed text-slate-600">
            {faq.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}