# PDF fonts

Fonts embedded into invoice and credit memo PDFs by `GeneratePdf` (app/services/generate_pdf.rb).

They're bundled here, not loaded from Google Fonts, so PDF rendering never depends on the network. The old renderer (wkhtmltopdf) fetched them on every render and sometimes gave up, silently falling back to Helvetica.

| File | Family / weight | Source | License |
|---|---|---|---|
| Lato-Bold.ttf | Lato 700 | github.com/google/fonts `ofl/lato` | SIL OFL 1.1 (Lato-OFL.txt) |
| Roboto-Regular.ttf | Roboto 400 | github.com/googlefonts/roboto `src/hinted` | SIL OFL 1.1 (Roboto-OFL.txt) |
| Tinos-Bold.ttf | Tinos 700 | github.com/google/fonts `ofl/tinos` | SIL OFL 1.1 (Tinos-OFL.txt) |

To add a font, put the `.ttf` here and add an entry to `GeneratePdf::FONTS`.
