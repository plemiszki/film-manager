require 'rails_helper'
require 'support/models_helper'

RSpec.describe Invoice do

  before do
    @invoice = Invoice.new
  end

  it 'allows empty sent dates' do
    @invoice.valid?
    expect(@invoice.errors.messages[:sent_date]).to match_array([])
  end

  it 'does not allow invalid sent dates' do
    @invoice.sent_date = "asdf"
    @invoice.valid?
    expect(@invoice.errors.messages[:sent_date]).to eq ['is not a valid date']
  end

  it 'parses dates using the US format' do
    test_parse_all_date_fields(@invoice)
  end

  describe '#export!' do
    it 'generates "Invoice <number>.pdf" in the given directory' do
      invoice = create(:dvd_invoice)
      create(:invoice_row, invoice_id: invoice.id)
      generator = instance_double(GeneratePdf, call: nil)
      allow(GeneratePdf).to receive(:new).and_return(generator)

      invoice.export!('/tmp/exports')

      expect(GeneratePdf).to have_received(:new).with(
        html: a_string_including('Invoice Number: 1D'),
        path: '/tmp/exports/Invoice 1D.pdf'
      )
      expect(generator).to have_received(:call)
    end
  end

end