require 'rails_helper'
require 'support/features_helper'
require 'support/controllers_helper'
include ActionView::Helpers::NumberHelper

describe 'royalty_report_details', type: :feature do

  before(:each) do
    create(:label)
    create(:licensor)
    create_revenue_streams
    @film = create(:film, deal_type_id: 2)
    @film.film_revenue_percentages.each do |revenue_percentage|
      revenue_percentage.update(value: 50)
    end
    @royalty_report = create(:expenses_recouped_from_top_royalty_report, film_id: @film.id, amount_paid: 20)
    @royalty_report.create_empty_streams!
    @royalty_report.royalty_revenue_streams.each_with_index do |royalty_revenue_stream, index|
      royalty_revenue_stream.update(current_revenue: 100 * index, cume_revenue: 1000 * index, current_expense: 10 * index, cume_expense: 100 * index)
    end
    @royalty_report.calculate!
  end

  it 'is gated' do
    visit royalty_report_path(@royalty_report)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays stored values in the report' do
    visit royalty_report_path(@royalty_report, as: $admin_user)
    wait_for_ajax
    flip_switch('include-current-period')
    0.upto(13) do |n|
      expect(find("input[data-test-index=\"#{n}\"][data-field=\"currentRevenue\"]").value).to eq(dollarify(number_with_precision(n * 100, precision: 2, delimiter: ',')))
      expect(find("input[data-test-index=\"#{n}\"][data-field=\"currentExpense\"]").value).to eq(dollarify(number_with_precision(n * 10, precision: 2, delimiter: ',')))
      expect(find("input[data-test-index=\"#{n}\"][data-field=\"cumeRevenue\"]").value).to eq(dollarify(number_with_precision(n * 1000, precision: 2, delimiter: ',')))
      expect(find("input[data-test-index=\"#{n}\"][data-field=\"cumeExpense\"]").value).to eq(dollarify(number_with_precision(n * 100, precision: 2, delimiter: ',')))
    end
    expect(find("input[data-field=\"eAndO\"]").value).to eq('$2,000.00')
    expect(find("input[data-field=\"mg\"]").value).to eq('$500.00')
    expect(find("input[data-field=\"amountPaid\"]").value).to eq('$20.00')
  end

  it 'calculates the report, not including current period' do
    visit royalty_report_path(@royalty_report, as: $admin_user)
    wait_for_ajax
    flip_switch('include-current-period')
    0.upto(13) do |n|
      current_difference = (n * 100) - (n * 10)
      current_net = current_difference.fdiv(2)
      cume_difference = (n * 1000) - (n * 100)
      cume_net = cume_difference.fdiv(2)
      expect(find("input[data-test-index=\"#{n}\"][data-field=\"currentDifference\"]").value).to eq(dollarify(number_with_precision(current_difference, precision: 2, delimiter: ',')))
      expect(find("input[data-test-index=\"#{n}\"][data-field=\"currentLicensorShare\"]").value).to eq(dollarify(number_with_precision(current_net, precision: 2, delimiter: ',')))
      expect(find("input[data-test-index=\"#{n}\"][data-field=\"cumeDifference\"]").value).to eq(dollarify(number_with_precision(cume_difference, precision: 2, delimiter: ',')))
      expect(find("input[data-test-index=\"#{n}\"][data-field=\"cumeLicensorShare\"]").value).to eq(dollarify(number_with_precision(cume_net, precision: 2, delimiter: ',')))
    end
    expect(find('input[data-field="currentTotalRevenue"]').value).to eq("$9,100.00")
    expect(find('input[data-field="currentTotalExpenses"]').value).to eq("$910.00")
    expect(find('input[data-field="currentTotal"]').value).to eq("$4,095.00")
    expect(find('input[data-field="cumeTotalRevenue"]').value).to eq("$91,000.00")
    expect(find('input[data-field="cumeTotalExpenses"]').value).to eq("$9,100.00")
    expect(find('input[data-field="cumeTotal"]').value).to eq("$40,950.00")
    expect(find('input[data-field="amountDue"]').value).to eq("$38,430.00")
  end

  it 'calculates the report, including current period' do
    visit royalty_report_path(@royalty_report, as: $admin_user)
    wait_for_ajax
    0.upto(13) do |n|
      current_difference = (n * 100) - (n * 10)
      current_net = current_difference.fdiv(2)
      cume_difference = (n * 1000) - (n * 100) + current_difference
      cume_net = cume_difference.fdiv(2)
      expect(find("input[data-test-index=\"#{n}\"][data-field=\"joinedDifference\"]").value).to eq(dollarify(number_with_precision(cume_difference, precision: 2, delimiter: ',')))
      expect(find("input[data-test-index=\"#{n}\"][data-field=\"joinedLicensorShare\"]").value).to eq(dollarify(number_with_precision(cume_net, precision: 2, delimiter: ',')))
    end
    expect(find('input[data-field="joinedTotalRevenue"]').value).to eq("$100,100.00")
    expect(find('input[data-field="joinedTotalExpenses"]').value).to eq("$10,010.00")
    expect(find('input[data-field="joinedTotal"]').value).to eq("$45,045.00")
    expect(find('input[data-field="joinedAmountDue"]').value).to eq("$42,525.00")
  end

  it 'displays only emails associated with the report' do
    create(:email,
      email_type: 'statement',
      recipient: 'associated@example.com',
      status: :delivered,
      sent_at: Time.zone.parse('2025-06-15 10:30:00'),
      metadata: { 'report_ids' => [@royalty_report.id], 'quarter' => 1, 'year' => 2025 },
      sender: $admin_user,
    )
    create(:email,
      email_type: 'statement',
      recipient: 'unassociated@example.com',
      status: :delivered,
      sent_at: Time.zone.parse('2025-06-15 10:30:00'),
      metadata: { 'report_ids' => [999], 'quarter' => 2, 'year' => 2025 },
      sender: $admin_user,
    )
    visit royalty_report_path(@royalty_report, as: $admin_user)
    wait_for_ajax
    expect(page).to have_content 'Statements - Q1 2025'
    expect(page).to have_content 'Peter Lemiszki'
    expect(page).to have_content 'associated@example.com'
    expect(page).to have_content '2025-06-15 10:30:00'
    expect(page).to have_content 'Delivered'
    expect(page).not_to have_content 'unassociated@example.com'
    expect(page).not_to have_content 'Statements - Q2 2025'
  end

  it 'validates stored values in the report' do
    visit royalty_report_path(@royalty_report, as: $admin_user)
    wait_for_ajax
    flip_switch('include-current-period')
    clear_form
    save_and_wait
    expect(find_all('input.error').count).to eq(87)
  end

  it 'updates stored values in the report' do
    visit royalty_report_path(@royalty_report, as: $admin_user)
    wait_for_ajax
    flip_switch('include-current-period')
    0.upto(13) do |n|
      x = n + 1
      current_revenue_field = find("input[data-test-index=\"#{n}\"][data-field=\"currentRevenue\"]")
      current_revenue_field.set(x * 100)
      current_expense_field = find("input[data-test-index=\"#{n}\"][data-field=\"currentExpense\"]")
      current_expense_field.set(x * 10)
      percentage_field = find("input[data-test-index=\"#{n}\"][data-field=\"licensorPercentage\"]", match: :first)
      percentage_field.set(x)
      cume_revenue_field = find("input[data-test-index=\"#{n}\"][data-field=\"cumeRevenue\"]")
      cume_revenue_field.set(x * 1_100)
      cume_expense_field = find("input[data-test-index=\"#{n}\"][data-field=\"cumeExpense\"]")
      cume_expense_field.set(x * 1_000)
    end
    data = {
      mg: 11,
      e_and_o: 12,
      amount_paid: 33
    }
    fill_out_form(data)
    save_and_wait
    verify_db(
      entity: @royalty_report,
      data: data
    )
    @royalty_report.royalty_revenue_streams.each_with_index do |royalty_revenue_stream, index|
      expect(royalty_revenue_stream.current_revenue).to eq((index + 1) * 100)
      expect(royalty_revenue_stream.current_expense).to eq((index + 1) * 10)
      expect(royalty_revenue_stream.licensor_percentage).to eq(index + 1)
      expect(royalty_revenue_stream.cume_revenue).to eq((index + 1) * 1100)
      expect(royalty_revenue_stream.cume_expense).to eq((index + 1) * 1000)
    end
  end

end
