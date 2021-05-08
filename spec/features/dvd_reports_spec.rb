require 'rails_helper'
require 'support/features_helper'

describe 'dvd_reports', type: :feature do

  before(:each) do
    create_dvd_types
    create(:label)
    create(:film)
    @wilby_wonderful_dvd = create(:dvd, pre_book_date: Date.today, retail_date: Date.today)
    create(:film, title: 'Ben X')
    @ben_x_dvd = create(:dvd, feature_film_id: 2, price: 14.95, pre_book_date: Date.today, retail_date: Date.today)
    create(:dvd_customer, name: 'AEC', include_in_title_report: true, per_unit: nil, discount: 0.6, nickname: 'aec')
    create(:dvd_customer, name: 'Midwest Tape', include_in_title_report: true, per_unit: nil, nickname: 'midwest')
  end

  it 'is gated' do
    visit dvd_reports_path
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'calculates report' do
    jan_date = Date.parse("1/1/#{Date.today.year}")
    feb_date = Date.parse("1/2/#{Date.today.year}")
    settings = create(:setting)
    @aec_january_po = create(:purchase_order, customer_id: 1, order_date: jan_date, ship_date: jan_date, number: 'JAN-AEC')
    create(:purchase_order_item, purchase_order_id: @aec_january_po.id, item_id: @wilby_wonderful_dvd.id)
    create(:purchase_order_item, purchase_order_id: @aec_january_po.id, item_id: @ben_x_dvd.id)
    Invoice.create_invoice_from_po(@aec_january_po, { sent_date: jan_date })
    settings.update(next_dvd_invoice_number: settings.next_dvd_invoice_number + 1)
    @midwest_january_po = create(:purchase_order, customer_id: 2, order_date: jan_date, ship_date: jan_date, number: 'JAN-MID')
    create(:purchase_order_item, purchase_order_id: @midwest_january_po.id, item_id: @wilby_wonderful_dvd.id)
    create(:purchase_order_item, purchase_order_id: @midwest_january_po.id, item_id: @ben_x_dvd.id, qty: 2)
    Invoice.create_invoice_from_po(@midwest_january_po, { sent_date: jan_date })
    settings.update(next_dvd_invoice_number: settings.next_dvd_invoice_number + 1)
    @aec_february_po = create(:purchase_order, customer_id: 1, order_date: feb_date, ship_date: feb_date, number: 'FEB-AEC')
    create(:purchase_order_item, purchase_order_id: @aec_february_po.id, item_id: @wilby_wonderful_dvd.id, qty: 3)
    create(:purchase_order_item, purchase_order_id: @aec_february_po.id, item_id: @ben_x_dvd.id)
    Invoice.create_invoice_from_po(@aec_february_po, { sent_date: feb_date })
    settings.update(next_dvd_invoice_number: settings.next_dvd_invoice_number + 1)
    @midwest_february_po = create(:purchase_order, customer_id: 2, order_date: feb_date, ship_date: feb_date, number: 'FEB-MID')
    create(:purchase_order_item, purchase_order_id: @midwest_february_po.id, item_id: @wilby_wonderful_dvd.id)
    create(:purchase_order_item, purchase_order_id: @midwest_february_po.id, item_id: @ben_x_dvd.id, qty: 5)
    Invoice.create_invoice_from_po(@midwest_february_po, { sent_date: feb_date })
    settings.update(next_dvd_invoice_number: settings.next_dvd_invoice_number + 1)
    visit dvd_reports_path(as: $admin_user)
    within('.months-report') do
      expect(find('td[data-test="aec-jan"]')).to have_content('$39.66')
      expect(find('td[data-test="aec-feb"]')).to have_content('$89.26')
      expect(find('td[data-test="aec-total"]')).to have_content('$128.92')
      expect(find('td[data-test="midwest-jan"]')).to have_content('$54.56')
      expect(find('td[data-test="midwest-feb"]')).to have_content('$99.17')
      expect(find('td[data-test="midwest-total"]')).to have_content('$153.73')
      expect(find('td[data-test="total-jan"]')).to have_content('$94.22')
      expect(find('td[data-test="total-feb"]')).to have_content('$188.43')
    end
    expect(find('td[data-test="year-total"]')).to have_content('$282.65')
    within('.titles-report') do
      expect(find('td[data-test="1-aec-sales"]')).to have_content('$99.20')
      expect(find('td[data-test="1-aec-units"]')).to have_content('4')
      expect(find('td[data-test="1-midwest-sales"]')).to have_content('$49.64')
      expect(find('td[data-test="1-midwest-units"]')).to have_content('2')
      expect(find('td[data-test="1-total-sales"]')).to have_content('$148.84')
      expect(find('td[data-test="1-total-units"]')).to have_content('6')
      expect(find('td[data-test="2-aec-sales"]')).to have_content('$29.72')
      expect(find('td[data-test="2-aec-units"]')).to have_content('2')
      expect(find('td[data-test="2-midwest-sales"]')).to have_content('$104.09')
      expect(find('td[data-test="2-midwest-units"]')).to have_content('7')
      expect(find('td[data-test="2-total-sales"]')).to have_content('$133.81')
      expect(find('td[data-test="2-total-units"]')).to have_content('9')
    end
  end

  it 'starts the export job' do
    visit dvd_reports_path(as: $admin_user)
    find('.export-button', text: 'Export').click
    find('.orange-button', text: 'Export Sales Report').click
    expect(page).to have_content('Exporting DVD Sales')
  end

end
