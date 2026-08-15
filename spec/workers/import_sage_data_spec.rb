require 'rails_helper'

RSpec.describe ImportSageData do
  let!(:label) { create(:label) }
  let!(:licensor) { create(:licensor) }
  let!(:territory) { create(:territory) }
  let!(:fm_subscription_stream) { create(:revenue_stream, name: 'FM Subscription') }
  let!(:non_theatrical_stream) { create(:revenue_stream, name: 'Non-Theatrical') }
  let!(:fm_plus_right) { create(:right, name: 'Film Movement Plus') }
  let!(:festival_right) { create(:right, name: 'Festival') }

  before do
    stub_const('ImportSageData::REVENUE_STREAM_IDS', {
      'FM Subscription' => fm_subscription_stream.id,
      'Non-Theatrical' => non_theatrical_stream.id
    })
    stub_const('ImportSageData::RIGHT_IDS', {
      'Film Movement Plus' => fm_plus_right.id,
      'Festival' => festival_right.id
    })
  end

  def build_film(title:, deal_type_id:)
    create(:film, title: title, deal_type_id: deal_type_id, label: label, licensor: licensor, ignore_sage_id: false)
  end

  def build_report(film)
    report = create(:royalty_report, film_id: film.id, deal_id: film.deal_type_id, quarter: 1, year: 2025)
    report.create_empty_streams!
    report
  end

  def fm_subscription_expense(report)
    RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: fm_subscription_stream.id).current_expense
  end

  def non_theatrical_expense(report)
    RoyaltyRevenueStream.find_by(royalty_report_id: report.id, revenue_stream_id: non_theatrical_stream.id).current_expense
  end

  describe '#apply_expense' do
    it "routes an expense to FM Subscription regardless of GL code when the film's only right is Film Movement Plus" do
      film = build_film(title: 'FM Plus Only', deal_type_id: 2)
      create(:film_right, film: film, right: fm_plus_right, territory: territory)
      report = build_report(film)

      described_class.new.apply_expense(film: film, label: 'expenses', gl: '40070', report: report, amount: 100, errors: [])

      expect(fm_subscription_expense(report)).to eq(100)
      expect(non_theatrical_expense(report)).to eq(0)
    end

    it 'falls back to normal GL code routing when the film has Film Movement Plus plus another right' do
      film = build_film(title: 'FM Plus And Festival', deal_type_id: 2)
      create(:film_right, film: film, right: fm_plus_right, territory: territory)
      create(:film_right, film: film, right: festival_right, territory: territory)
      report = build_report(film)

      described_class.new.apply_expense(film: film, label: 'expenses', gl: '40070', report: report, amount: 100, errors: [])

      expect(non_theatrical_expense(report)).to eq(100)
      expect(fm_subscription_expense(report)).to eq(0)
    end

    it 'falls back to normal GL code routing when the film has no rights at all' do
      film = build_film(title: 'No Rights', deal_type_id: 2)
      report = build_report(film)

      described_class.new.apply_expense(film: film, label: 'expenses', gl: '40070', report: report, amount: 100, errors: [])

      expect(non_theatrical_expense(report)).to eq(100)
      expect(fm_subscription_expense(report)).to eq(0)
    end

    it 'applies the override even for deal_type_id 3, unlike most per-GL-code branches which skip that deal type' do
      film = build_film(title: 'FM Plus Theatrical Deal', deal_type_id: 3)
      create(:film_right, film: film, right: fm_plus_right, territory: territory)
      report = build_report(film)

      described_class.new.apply_expense(film: film, label: 'expenses', gl: '40070', report: report, amount: 100, errors: [])

      expect(fm_subscription_expense(report)).to eq(100)
    end

    it 'does not apply the override for deal_type_id 4, which bypasses stream-based routing entirely' do
      film = build_film(title: 'FM Plus Licensor Share Deal', deal_type_id: 4)
      create(:film_right, film: film, right: fm_plus_right, territory: territory)
      report = build_report(film)

      described_class.new.apply_expense(film: film, label: 'expenses', gl: '40070', report: report, amount: 100, errors: [])

      expect(fm_subscription_expense(report)).to eq(0)
      expect(report.reload.current_total_expenses).to eq(100)
    end
  end
end
