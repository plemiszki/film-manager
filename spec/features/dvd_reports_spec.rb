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
    feb_date = Date.parse("2/1/#{Date.today.year}")
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
    wait_for_ajax
    within('table[data-test="customers-report"]') do
      expect(find('div[data-test="0-0"]')).to have_content('$128.92')
      expect(find('div[data-test="0-1"]')).to have_content('$39.66')
      expect(find('div[data-test="0-2"]')).to have_content('$89.26')
      expect(find('div[data-test="1-0"]')).to have_content('$153.73')
      expect(find('div[data-test="1-1"]')).to have_content('$54.56')
      expect(find('div[data-test="1-2"]')).to have_content('$99.17')
      expect(find('div[data-test="2-1"]')).to have_content('$94.22')
      expect(find('div[data-test="2-2"]')).to have_content('$188.43')
      expect(find('div[data-test="2-0"]')).to have_content('$282.65')
    end
    within('table[data-test="titles-report"]') do
      expect(find('div[data-test="0-3"]')).to have_content('6')
      expect(find('div[data-test="0-4"]')).to have_content('$148.84')
      expect(find('div[data-test="0-5"]')).to have_content('4')
      expect(find('div[data-test="0-6"]')).to have_content('$99.20')
      expect(find('div[data-test="0-7"]')).to have_content('2')
      expect(find('div[data-test="0-8"]')).to have_content('$49.64')
      expect(find('div[data-test="1-3"]')).to have_content('9')
      expect(find('div[data-test="1-4"]')).to have_content('$133.81')
      expect(find('div[data-test="1-5"]')).to have_content('2')
      expect(find('div[data-test="1-6"]')).to have_content('$29.72')
      expect(find('div[data-test="1-7"]')).to have_content('7')
      expect(find('div[data-test="1-8"]')).to have_content('$104.09')
    end
  end

  it 'starts the export job' do
    visit dvd_reports_path(as: $admin_user)
    click_btn('Export')
    click_btn('Export Sales Report')
    expect(page).to have_content('Exporting DVD Sales')
  end

end
