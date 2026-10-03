require 'rails_helper'

RSpec.describe CreditMemo do

  describe '#export' do
    it 'generates the pdf at the given path' do
      create(:dvd_customer)
      credit_memo = create(:credit_memo)
      generator = instance_double(GeneratePdf, call: nil)
      allow(GeneratePdf).to receive(:new).and_return(generator)

      credit_memo.export('/tmp/exports/Credit Memo CM23.pdf')

      expect(GeneratePdf).to have_received(:new).with(
        html: a_string_including('Credit Memo Number: CM23'),
        path: '/tmp/exports/Credit Memo CM23.pdf'
      )
      expect(generator).to have_received(:call)
    end
  end

end
