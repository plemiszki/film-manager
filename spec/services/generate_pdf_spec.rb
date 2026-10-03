require 'rails_helper'

RSpec.describe GeneratePdf do
  let(:html) { '<p>Invoice 1D</p>' }
  let(:pdf_bytes) { "%PDF-1.4\xFF\x00binary".b }
  let(:wicked_pdf) { instance_double(WickedPdf) }

  before do
    allow(WickedPdf).to receive(:new).and_return(wicked_pdf)
    allow(wicked_pdf).to receive(:pdf_from_string).and_return(pdf_bytes)
  end

  it 'renders the html and writes the pdf bytes to the path' do
    Dir.mktmpdir do |dir|
      path = "#{dir}/Invoice 1D.pdf"
      described_class.new(html: html, path: path).call
      expect(wicked_pdf).to have_received(:pdf_from_string).with(html)
      expect(File.binread(path)).to eq(pdf_bytes)
    end
  end

  it 'returns the path' do
    Dir.mktmpdir do |dir|
      path = "#{dir}/statement.pdf"
      expect(described_class.new(html: html, path: path).call).to eq(path)
    end
  end
end
