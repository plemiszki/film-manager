require 'rails_helper'
require 'support/controllers_helper'

RSpec.describe RoyaltyReport do

  it 'calculates reserves properly' do

    create(:label)
    create(:revenue_stream, name: 'Video')

    # 2 reserve quarters, 100% reserve against returns
    film = create(
      :no_expenses_recouped_film,
      reserve: true,
      reserve_quarters: 2,
      reserve_percentage: 100,
      mg: 0,
      e_and_o: 0
    )

    # 100% to licensor
    film.film_revenue_percentages.first.update(value: 100)

    # create first report with $100 dvd revenue
    @first_report = film.create_royalty_statement!(1, 2020)
    @first_report.royalty_revenue_streams.first.update(current_revenue: 100)

    # test first report
    @first_report.calculate!

    expect(@first_report.current_total).to eq(100)
    expect(@first_report.current_reserve).to eq(100)

    expect(@first_report.cume_total).to eq(0)
    expect(@first_report.cume_reserve).to eq(0)
    expect(@first_report.amount_due).to eq(0)

    expect(@first_report.joined_total).to eq(100)
    expect(@first_report.joined_reserve).to eq(100)
    expect(@first_report.joined_amount_due).to eq(0)

    # create second report with $100 more dvd revenue
    @second_report = film.create_royalty_statement!(2, 2020)
    @second_report.royalty_revenue_streams.first.update(current_revenue: 100)

    # test second report
    @second_report.calculate!

    expect(@second_report.current_total).to eq(100)
    expect(@second_report.current_reserve).to eq(100)

    expect(@second_report.cume_total).to eq(100)
    expect(@second_report.cume_reserve).to eq(100)
    expect(@second_report.amount_due).to eq(0)

    expect(@second_report.joined_total).to eq(200)
    expect(@second_report.joined_reserve).to eq(200)
    expect(@second_report.joined_amount_due).to eq(0)

    # create third report with no revenue
    @third_report = film.create_royalty_statement!(3, 2020)

    # test third report
    @third_report.calculate!

    expect(@third_report.current_total).to eq(0)
    expect(@third_report.current_reserve).to eq(0)
    expect(@third_report.current_liquidated_reserve).to eq(100) # <--

    expect(@third_report.cume_total).to eq(200)
    expect(@third_report.cume_reserve).to eq(200)
    expect(@third_report.cume_liquidated_reserve).to eq(0)
    expect(@third_report.amount_due).to eq(0)

    expect(@third_report.joined_total).to eq(200)
    expect(@third_report.joined_reserve).to eq(200)
    expect(@third_report.joined_liquidated_reserve).to eq(100)
    expect(@third_report.joined_amount_due).to eq(100)

    # create fourth report with no revenue
    @fourth_report = film.create_royalty_statement!(4, 2020)

    # test fourth report
    @fourth_report.calculate!

    expect(@fourth_report.current_total).to eq(0)
    expect(@fourth_report.current_reserve).to eq(0)
    expect(@fourth_report.current_liquidated_reserve).to eq(100) # <--

    expect(@fourth_report.cume_total).to eq(200)
    expect(@fourth_report.cume_reserve).to eq(200)
    expect(@fourth_report.cume_liquidated_reserve).to eq(100) # <--
    expect(@fourth_report.amount_due).to eq(100) # <--

    expect(@fourth_report.joined_total).to eq(200)
    expect(@fourth_report.joined_reserve).to eq(200)
    expect(@fourth_report.joined_liquidated_reserve).to eq(200)
    expect(@fourth_report.amount_paid).to eq(100)
    expect(@fourth_report.joined_amount_due).to eq(100)

    # create fifth report with no revenue
    @fifth_report = film.create_royalty_statement!(1, 2021)

    # test fifth report
    @fifth_report.calculate!

    expect(@fifth_report.current_total).to eq(0)
    expect(@fifth_report.current_reserve).to eq(0)
    expect(@fifth_report.current_liquidated_reserve).to eq(0)

    expect(@fifth_report.cume_total).to eq(200)
    expect(@fifth_report.cume_reserve).to eq(200)
    expect(@fifth_report.cume_liquidated_reserve).to eq(200) # <--
    expect(@fifth_report.amount_due).to eq(200) # <--

    expect(@fifth_report.joined_total).to eq(200)
    expect(@fifth_report.joined_reserve).to eq(200)
    expect(@fifth_report.joined_liquidated_reserve).to eq(200)
    expect(@fifth_report.amount_paid).to eq(200)
    expect(@fifth_report.joined_amount_due).to eq(0)
  end

end
