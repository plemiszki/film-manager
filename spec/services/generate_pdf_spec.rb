require 'rails_helper'

RSpec.describe GeneratePdf do
  def embedded_fonts(path)
    File.binread(path).scan(%r{/BaseFont\s*/([A-Za-z0-9+_-]+)}).flatten.map { |name| name.sub(/\A[A-Z]{6}\+/, '') }.uniq
  end

  around do |example|
    Dir.mktmpdir { |dir| @dir = dir; example.run }
  end

  it 'writes an A4 pdf to the path and returns the path' do
    path = "#{@dir}/Invoice 1D.pdf"
    result = described_class.new(html: '<p>Invoice 1D</p>', path: path).call

    expect(result).to eq(path)
    pdf = File.binread(path)
    expect(pdf).to start_with('%PDF')
    width, height = pdf.match(%r{/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]}).captures
    expect(width.to_f).to be_within(2).of(595) # A4 is 595 x 842 points
    expect(height.to_f).to be_within(2).of(842)
  end

  it 'embeds only the bundled fonts the html uses' do
    path = "#{@dir}/fonts.pdf"
    html = <<~HTML
      <style>.bold { font-family: Lato; } body { font-family: Roboto; }</style>
      <p>Body text</p><p class="bold">Bill To:</p>
    HTML
    described_class.new(html: html, path: path).call

    fonts = embedded_fonts(path)
    expect(fonts).to include('Lato-Bold', 'Roboto-Regular')
    expect(fonts).not_to include('Tinos-Bold')
  end
end
