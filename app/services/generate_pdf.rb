class GeneratePdf

  # Bundled in lib/pdf_fonts and embedded as base64 so wkhtmltopdf never fetches
  # fonts over the network (which sometimes failed and fell back to Helvetica).
  FONT_DIR = Rails.root.join('lib', 'pdf_fonts')
  FONTS = [
    { family: 'Lato', weight: 700, file: 'Lato-Bold.ttf' },
    { family: 'Roboto', weight: 400, file: 'Roboto-Regular.ttf' },
    { family: 'Tinos', weight: 700, file: 'Tinos-Bold.ttf' },
  ].freeze

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
    File.binwrite(@path, WickedPdf.new.pdf_from_string(font_styles + @html))
    @path
  end

  private

  # only embed fonts the document actually uses
  def font_styles
    used = FONTS.select { |font| @html.match?(/font-family:\s*['"]?#{font[:family]}\b/) }
    return '' if used.empty?
    "<style>#{used.map { |font| self.class.font_face_css(font) }.join}</style>"
  end

end
