# CBO API v1.1 — αλλαγές της 3ης Νοεμβρίου 2026 / changes of 3 November 2026

Οι αλλαγές ισχύουν στο v1.1 (`https://app.cbo.gr/api/v1.1`) από τις 3/11/2026. Δεν υπάρχει νέα έκδοση: το v1.1 αλλάζει επί τόπου. Πλήρης λίστα στο [changelog](./v1.md).

The changes apply to v1.1 (`https://app.cbo.gr/api/v1.1`) from 3 November 2026. There is no new version: v1.1 changes in place. Full list in the [changelog](./v1.md).

---

## Ελληνικά

### Τι πρέπει να κάνετε

1. **Τιμολόγια προμηθευτών (`POST /supplier-invoices`).** Αν στέλνετε `invoice_type_id` (ή `document_id`) ή `invoice_series_id`, προσθέστε `"is_self_issued": true`. Χωρίς αυτό, το αίτημα θεωρείται **καταχώριση αγοράς** και επιστρέφει 422. Αν καταχωρείτε παραστατικά που λάβατε από προμηθευτές, **μην** στέλνετε `invoice_type_id`, `invoice_series_id` ή `mydata_submit: true`. Στείλτε τον αριθμό του προμηθευτή στο `serial_number`, τη σειρά του στο `invoice_series` και, αν θέλετε, ένα όνομα στο `representation`.
2. **Σειρά τιμολογίου προμηθευτή στην απάντηση.** Το `invoice_series_id` είναι πλέον μόνο το id της δικής μας σειράς. Τη σειρά ως κείμενο (και τη σειρά του προμηθευτή) τη διαβάζετε από το νέο `invoice_series`.
3. **Δελτία αποστολής στα τιμολόγια πελατών.** Ένα συνδεδεμένο `delivery-note` / `delivery-return` εμφανίζεται πλέον στο `delivery_notes`, όχι στο `related_documents`. Αν το αναζητούσατε στο `related_documents`, διαβάστε το `delivery_notes`.
4. **Σφάλμα «ο αριθμός υπάρχει ήδη».** Αν διαβάζατε το `errors[0][0]`, διαβάστε πλέον το `errors.serial_number`. Το νέο κείμενο είναι: «Ο σειριακός αριθμός δεν είναι έγκυρος, γιατί υπάρχει ήδη.». Ένας αριθμός που πληκτρολογείτε απορρίπτεται πλέον όταν τον έχει ήδη παραστατικό που εκδόθηκε ή ακυρώθηκε στην ίδια αρίθμηση (εταιρεία, υποκατάστημα, σειρά, τύπος myDATA), ακόμη κι αν δεν στάλθηκε ποτέ στο myDATA.
5. **Τύποι παραστατικών.** Στέλνετε `document_type` αντί για `type`, και `dispatch_details_enabled` αντί για `is_deliverable`. Τα παλιά πεδία γίνονται ακόμη δεκτά, αλλά είναι deprecated. Αν στείλετε και τα δύο, κερδίζει το νέο.

### Παραδείγματα: τιμολόγιο προμηθευτή

**Καταχώριση αγοράς** (προεπιλογή: χωρίς `is_self_issued` ή με `false`):

```json
{
  "date": "2026-11-03",
  "supplier_id": 7,
  "document_type": "invoice",
  "serial_number": 44,
  "invoice_series": "Α",
  "representation": "Τιμολόγιο ΔΕΗ 44",
  "billing_address": { "address": "Χαλκοκονδύλη", "number": "30", "town": "Αθήνα", "zip": "10432", "country": "GR" },
  "items": [
    { "description": "Ηλεκτρική ενέργεια Οκτωβρίου", "quantity": 1, "measure_unit": "τεμ.", "unit_price": 200, "taxes": [1] }
  ]
}
```

**Έκδοση δικού μας παραστατικού** (π.χ. αυτοτιμολόγηση ή δελτίο που στέλνουμε):

```json
{
  "is_self_issued": true,
  "invoice_type_id": 12,
  "invoice_series_id": 3,
  "date": "2026-11-03",
  "supplier_id": 7,
  "document_type": "invoice",
  "mydata_submit": true,
  "billing_address": { "address": "Ερμού", "number": "10", "town": "Αθήνα", "zip": "10563", "country": "GR" },
  "items": [
    { "product_id": 101, "quantity": 2, "unit_price": 100, "taxes": [1],
      "mydata_classification_category": "category2_1", "mydata_classification_type": "E3_102_001" }
  ]
}
```

Το `invoice_type_id` πρέπει να είναι τύπος της εταιρείας σας, για προμηθευτές (`account` `supplier` ή `both`), με ίδιο `document_type`. Αν παραλείψετε το `serial_number`, ο αριθμός δίνεται κατά την έκδοση.

### Νέες περιπτώσεις 422

| Endpoint | Πότε | Απάντηση |
|---|---|---|
| `POST /supplier-invoices` | `invoice_type_id` / `document_id` σε καταχώριση | `validation_error`, `errors.invoice_type_id`: "invoice_type_id is only accepted when is_self_issued is true." |
| `POST /supplier-invoices` | `invoice_series_id` σε καταχώριση | `validation_error`, `errors.invoice_series_id`: "invoice_series_id is only accepted when is_self_issued is true." |
| `POST /supplier-invoices` | `representation` σε έκδοση | `validation_error`, `errors.representation`: "representation is only accepted when registering a purchase (is_self_issued is false)." |
| `POST /supplier-invoices` | `invoice_series` σε έκδοση | `validation_error`, `errors.invoice_series` |
| `POST /supplier-invoices`, `POST /supplier-invoices/{id}/publish` | `mydata_submit: true` σε καταχώριση | `validation_error`, `errors.mydata_submit`: "Registered supplier invoices cannot be submitted to myDATA." |
| `POST /supplier-invoices` | απόρριψη από myDATA (δεν αποθηκεύεται τίποτα· πριν ήταν 500) | `business_validation_error`, μήνυμα του CBO για το σφάλμα της ΑΑΔΕ |
| `POST /invoices/{id}/publish` | κατάσταση εκτός `Draft` / `Executed` (π.χ. `Pending`· πριν ήταν 200) | `business_validation_error`: "Only draft invoices can be published (current status: Pending)." |
| `POST /invoices/{id}/publish`, `POST /invoices` | αριθμός που υπάρχει ήδη | `validation_error`, `errors.serial_number`: "Ο σειριακός αριθμός δεν είναι έγκυρος, γιατί υπάρχει ήδη." |
| `POST /invoices/{id}/publish`, `POST /invoices` | είδος με σειριακούς αριθμούς χωρίς αρκετούς σειριακούς | `validation_error`: «Το Προϊόν … έχει δηλωθεί με λιγότερους σειριακούς αριθμούς από την ποσότητα. Παρακαλώ διορθώστε.» |
| `POST /invoices/{id}/publish`, `POST /invoices` | πάνω από 350 γραμμές (νέο κείμενο) | `validation_error`: «Ο αριθμός των ειδών υπερβαίνει το όριο (350). Παρακαλώ χωρίστε το παραστατικό.» |
| `POST /invoices/{id}/publish` | `mydata_submit: true` σε παραστατικό που έχει ήδη MARK | `validation_error`: «Το παραστατικό έχει ήδη διαβιβαστεί στο myDATA και δεν στέλνεται ξανά.» |
| `POST /invoices` | id παραστατικού άλλης εταιρείας στο `related_documents` / `delivery_notes` | `validation_error`, `errors.related_documents.N` / `errors.delivery_notes.N` |
| `POST /invoice-types`, `PUT /invoice-types/{id}` | `aade_type` που δεν επιτρέπεται για το `document_type` | `validation_error`, ένα μήνυμα στο `errors.aade_type` |

### Λοιπές αλλαγές (χωρίς ενέργεια από εσάς)

- Νέο `POST /supplier-invoices/{id}/publish` και νέο `PUT` / `PATCH /invoice-types/{id}`.
- Το `POST /invoices/{id}/publish` με `Executed` + `mydata_submit: true` ξαναστέλνει μόνο στο myDATA (χωρίς νέο αριθμό, αποδείξεις ή κίνηση αποθήκης). Εταιρεία χωρίς ρυθμίσεις myDATA: το παραστατικό εκδίδεται χωρίς αποστολή.
- Το `document_type: cash-register` γίνεται ξανά δεκτό και αποθηκεύεται ως `retail` (και ως φίλτρο). Γίνονται δεκτά τα `invoice-income` / `accommodation-income` (7.1, 8.1, 8.2).
- `GET /invoice-types`: νέα πεδία `account`, `dispatch_details_enabled`, `dispatch_policy`, `has_billing`, `only_clients`, `default_move_purpose`· το φίλτρο `type` (1–7, τιμή ή πίνακας) δουλεύει ξανά.
- `POST /supplier-invoices` με `isDraft: true`: το παραστατικό μένει `Draft` (πριν αποθηκευόταν `Executed`).
- `POST /groups`: `sort` κενό ή `0` κατά τη δημιουργία τοποθετεί την ομάδα στο τέλος.

---

## English

### What you need to do

1. **Supplier invoices (`POST /supplier-invoices`).** If you send `invoice_type_id` (or `document_id`) or `invoice_series_id`, add `"is_self_issued": true`. Without it the request is treated as **registering a purchase** and returns 422. If you register documents you received from suppliers, do **not** send `invoice_type_id`, `invoice_series_id` or `mydata_submit: true`. Send the supplier's number in `serial_number`, its series in `invoice_series` and, optionally, a name in `representation`.
2. **Supplier invoice series in responses.** `invoice_series_id` is now only the id of our own series. Read the series as text (including the supplier's series) from the new `invoice_series` key.
3. **Delivery notes on client invoices.** A linked `delivery-note` / `delivery-return` is now listed under `delivery_notes`, not `related_documents`. If you looked for it in `related_documents`, read `delivery_notes`.
4. **"Number already used" error.** If you read `errors[0][0]`, read `errors.serial_number` instead. The new text is "Ο σειριακός αριθμός δεν είναι έγκυρος, γιατί υπάρχει ήδη.". A hand-typed number is now refused when an issued or cancelled document already holds it in the same numbering scope (company, branch, series, myDATA type), even if that document was never sent to myDATA.
5. **Invoice types.** Send `document_type` instead of `type`, and `dispatch_details_enabled` instead of `is_deliverable`. The old fields are still accepted but deprecated. When both are sent, the new one wins.

### Examples: supplier invoice

**Register a purchase** (the default: `is_self_issued` omitted or `false`):

```json
{
  "date": "2026-11-03",
  "supplier_id": 7,
  "document_type": "invoice",
  "serial_number": 44,
  "invoice_series": "Α",
  "representation": "Τιμολόγιο ΔΕΗ 44",
  "billing_address": { "address": "Χαλκοκονδύλη", "number": "30", "town": "Αθήνα", "zip": "10432", "country": "GR" },
  "items": [
    { "description": "Ηλεκτρική ενέργεια Οκτωβρίου", "quantity": 1, "measure_unit": "τεμ.", "unit_price": 200, "taxes": [1] }
  ]
}
```

**Issue our own document** (e.g. self-billing, or a delivery note we send):

```json
{
  "is_self_issued": true,
  "invoice_type_id": 12,
  "invoice_series_id": 3,
  "date": "2026-11-03",
  "supplier_id": 7,
  "document_type": "invoice",
  "mydata_submit": true,
  "billing_address": { "address": "Ερμού", "number": "10", "town": "Αθήνα", "zip": "10563", "country": "GR" },
  "items": [
    { "product_id": 101, "quantity": 2, "unit_price": 100, "taxes": [1],
      "mydata_classification_category": "category2_1", "mydata_classification_type": "E3_102_001" }
  ]
}
```

`invoice_type_id` must be one of your company's supplier-side types (`account` `supplier` or `both`) with the same `document_type`. If you omit `serial_number`, the document is numbered when it is published.

### New 422 cases

| Endpoint | When | Response |
|---|---|---|
| `POST /supplier-invoices` | `invoice_type_id` / `document_id` while registering | `validation_error`, `errors.invoice_type_id`: "invoice_type_id is only accepted when is_self_issued is true." |
| `POST /supplier-invoices` | `invoice_series_id` while registering | `validation_error`, `errors.invoice_series_id`: "invoice_series_id is only accepted when is_self_issued is true." |
| `POST /supplier-invoices` | `representation` while issuing | `validation_error`, `errors.representation`: "representation is only accepted when registering a purchase (is_self_issued is false)." |
| `POST /supplier-invoices` | `invoice_series` while issuing | `validation_error`, `errors.invoice_series` |
| `POST /supplier-invoices`, `POST /supplier-invoices/{id}/publish` | `mydata_submit: true` on a registered purchase | `validation_error`, `errors.mydata_submit`: "Registered supplier invoices cannot be submitted to myDATA." |
| `POST /supplier-invoices` | myDATA rejects the document (nothing is stored; was a 500) | `business_validation_error`, CBO's message for the AADE error |
| `POST /invoices/{id}/publish` | status other than `Draft` / `Executed`, e.g. `Pending` (was 200) | `business_validation_error`: "Only draft invoices can be published (current status: Pending)." |
| `POST /invoices/{id}/publish`, `POST /invoices` | number already held in its numbering scope | `validation_error`, `errors.serial_number`: "Ο σειριακός αριθμός δεν είναι έγκυρος, γιατί υπάρχει ήδη." |
| `POST /invoices/{id}/publish`, `POST /invoices` | serial-tracked product line without enough serial numbers | `validation_error`: "Το Προϊόν … έχει δηλωθεί με λιγότερους σειριακούς αριθμούς από την ποσότητα. Παρακαλώ διορθώστε." |
| `POST /invoices/{id}/publish`, `POST /invoices` | more than 350 lines (new text) | `validation_error`: "Ο αριθμός των ειδών υπερβαίνει το όριο (350). Παρακαλώ χωρίστε το παραστατικό." |
| `POST /invoices/{id}/publish` | `mydata_submit: true` on an invoice that already holds a MARK | `validation_error`: "Το παραστατικό έχει ήδη διαβιβαστεί στο myDATA και δεν στέλνεται ξανά." |
| `POST /invoices` | another company's document id in `related_documents` / `delivery_notes` | `validation_error`, `errors.related_documents.N` / `errors.delivery_notes.N` |
| `POST /invoice-types`, `PUT /invoice-types/{id}` | `aade_type` not allowed for the `document_type` | `validation_error`, one message under `errors.aade_type` |

Error messages are returned in Greek where shown in Greek.

### Other changes (no action needed)

- New `POST /supplier-invoices/{id}/publish` and new `PUT` / `PATCH /invoice-types/{id}`.
- `POST /invoices/{id}/publish` with an `Executed` invoice and `mydata_submit: true` only retries the myDATA transmission (no new number, receipts or stock movement). A company without myDATA settings gets the invoice published without sending.
- `document_type: cash-register` is accepted again and stored as `retail` (also as a filter). `invoice-income` / `accommodation-income` (7.1, 8.1, 8.2) are accepted.
- `GET /invoice-types`: new fields `account`, `dispatch_details_enabled`, `dispatch_policy`, `has_billing`, `only_clients`, `default_move_purpose`; the `type` filter (1–7, one value or an array) works again.
- `POST /supplier-invoices` with `isDraft: true`: the invoice stays `Draft` (it used to be stored `Executed`).
- `POST /groups`: `sort` empty or `0` on create places the group at the end.
