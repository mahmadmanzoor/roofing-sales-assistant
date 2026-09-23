# Pricing selection and document delivery

After measurements are approved, the contractor chooses saved pricing, demo pricing, or a saved distributor contact. Distributor and homeowner emails are shown in full and require an explicit confirmation before the demo simulator records them as sent.

Measurement approval produces an unpriced material takeoff PDF. Choosing a pricing source produces a priced takeoff without contractor margin. Proposal generation adds the contractor margin and produces the customer-facing proposal PDF, then previews the exact recipient, subject, body, and attachment link before confirmation.

Customer-facing links use an opaque document reference and do not expose database job IDs or API routes.

The MVP keeps one deterministic price book for both saved and demo pricing. Distributor requests use demo contacts and a simulated quote response; no real email or distributor API is enabled.
