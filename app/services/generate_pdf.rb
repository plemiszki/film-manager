class GeneratePdf

  # Bundled in lib/pdf_fonts and embedded as base64 so rendering never fetches
  # fonts over the network.
  FONT_DIR = Rails.root.join('lib', 'pdf_fonts')
  FONTS = [
    { family: 'Lato', weight: 700, file: 'Lato-Bold.ttf' },
    { family: 'Roboto', weight: 400, file: 'Roboto-Regular.ttf' },
    { family: 'Tinos', weight: 700, file: 'Tinos-Bold.ttf' },
  ].freeze

  # Headless Chrome via Ferrum. Chrome is found on PATH (or BROWSER_PATH).
  # On Heroku, `dockerize` adds the no-sandbox flags Chrome needs inside a dyno.
  BROWSER_OPTIONS = {
    headless: true,
    timeout: 30,
    process_timeout: 30,
    browser_path: ENV['BROWSER_PATH'],
    dockerize: ENV.key?('DYNO'),
  }.freeze

  # A4 with 10mm margins, matching the old wkhtmltopdf output. `scale` matches
  # wkhtmltopdf's smart shrinking, which the row-based page breaks in Invoice and
  # CreditMemo (DVDS_ON_FIRST_PAGE / DVDS_PER_PAGE) depend on.
  MARGIN_INCHES = 10 / 25.4
  PDF_OPTIONS = {
    format: :A4,
    print_background: true,
    scale: 0.8,
    margin_top: MARGIN_INCHES,
    margin_bottom: MARGIN_INCHES,
    margin_left: MARGIN_INCHES,
    margin_right: MARGIN_INCHES,
  }.freeze

  def self.font_face_css(font)
    @font_face_css ||= {}
    @font_face_css[font[:file]] ||= begin
      data = Base64.strict_encode64(File.binread(FONT_DIR.join(font[:file])))
      "@font-face { font-family: '#{font[:family]}'; font-style: normal; font-weight: #{font[:weight]}; " \
        "src: url(data:font/truetype;base64,#{data}) format('truetype'); }"
    end
  end

  def initialize(html:, path:)
    @html = html
    @path = path
  end

  def call
    browser = Ferrum::Browser.new(**BROWSER_OPTIONS)
    page = browser.create_page
    page.content = font_styles + @html
    # print only once every font has loaded
    page.evaluate_async('document.fonts.ready.then(() => arguments[0](true))', BROWSER_OPTIONS[:timeout])
    page.pdf(path: @path, **PDF_OPTIONS)
    @path
  ensure
    browser&.quit
  end

  private

  # only embed fonts the document actually uses
  def font_styles
    used = FONTS.select { |font| @html.match?(/font-family:\s*['"]?#{font[:family]}\b/) }
    return '' if used.empty?
    "<style>#{used.map { |font| self.class.font_face_css(font) }.join}</style>"
  end

end
