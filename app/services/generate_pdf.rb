class GeneratePdf

  def initialize(html:, path:)
    @html = html
    @path = path
  end

  def call
    File.binwrite(@path, WickedPdf.new.pdf_from_string(@html))
    @path
  end

end
