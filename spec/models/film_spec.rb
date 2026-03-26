require 'rails_helper'
require 'support/models_helper'

RSpec.describe Film do

  before do
    @film = Film.new
  end

  it 'allows empty date fields' do
    @film.valid?
    expect(@film.errors.messages[:start_date]).to match_array([])
    expect(@film.errors.messages[:end_date]).to match_array([])
    expect(@film.errors.messages[:avod_release]).to match_array([])
    expect(@film.errors.messages[:tvod_release]).to match_array([])
    expect(@film.errors.messages[:svod_release]).to match_array([])
    expect(@film.errors.messages[:fm_plus_release]).to match_array([])
    expect(@film.errors.messages[:club_date]).to match_array([])
    expect(@film.errors.messages[:theatrical_release]).to match_array([])
    expect(@film.errors.messages[:accept_delivery]).to match_array([])
  end

  it 'does not allow invalid dates' do
    @film.start_date = "asdf"
    @film.end_date = "asdf"
    @film.avod_release = "asdf"
    @film.tvod_release = "asdf"
    @film.svod_release = "asdf"
    @film.fm_plus_release = "asdf"
    @film.club_date = "asdf"
    @film.theatrical_release = "asdf"
    @film.accept_delivery = "asdf"
    @film.valid?
    expect(@film.errors.messages[:start_date]).to eq ['is not a valid date']
    expect(@film.errors.messages[:end_date]).to eq ['is not a valid date']
    expect(@film.errors.messages[:avod_release]).to eq ['is not a valid date']
    expect(@film.errors.messages[:tvod_release]).to eq ['is not a valid date']
    expect(@film.errors.messages[:svod_release]).to eq ['is not a valid date']
    expect(@film.errors.messages[:fm_plus_release]).to eq ['is not a valid date']
    expect(@film.errors.messages[:club_date]).to eq ['is not a valid date']
    expect(@film.errors.messages[:theatrical_release]).to eq ['is not a valid date']
    expect(@film.errors.messages[:accept_delivery]).to eq ['is not a valid date']
  end

  it 'parses dates using the US format' do
    test_parse_all_date_fields(@film)
  end

  it 'does not allow duplicate club dates' do
    create(:label)
    create(:no_expenses_recouped_film, club_date: "3/1/20")
    @film.update(club_date: "3/1/20")
    @film.valid?
    expect(@film.errors.messages[:club_date]).to eq ['has already been taken']
  end

  it 'does not allow end_date after start_date' do
    @film.start_date = Date.today
    @film.end_date = Date.today - 1.day
    @film.valid?
    expect(@film.errors.messages[:end_date]).to eq ['cannot be before start date']
  end

  it 'updates associated film_right end dates correctly when auto-renew is toggled' do
    create(:label)
    film = create(:film, auto_renew: false)
    create(:territory)
    create(:right)
    film_right = create(:film_right)
    expect(film_right.end_date_calc).to eq(Date.today + 1.year)

    film.update!(auto_renew: true, auto_renew_term: 12)
    expect(film_right.reload.end_date_calc).to eq(Date.today + 2.years)

    film.update!(auto_renew_opt_out: true)
    expect(film_right.reload.end_date_calc).to eq(Date.today + 1.year)

    film.update!(auto_renew: false, auto_renew_opt_out: false)
    expect(film_right.reload.end_date_calc).to eq(Date.today + 1.year)
  end

  describe '#fm_subscription_only?' do
    before do
      create(:label)
      create(:revenue_stream, name: 'Theatrical')
      @fm_sub_stream = create(:revenue_stream, name: 'FM Subscription')
      @film = create(:film)
    end

    it 'returns true when only FM Subscription has a non-zero value' do
      @film.film_revenue_percentages.find_by(revenue_stream_id: @fm_sub_stream.id).update!(value: 50)
      expect(@film.fm_subscription_only?).to eq(true)
    end

    it 'returns false when FM Subscription is non-zero but another stream is also non-zero' do
      @film.film_revenue_percentages.find_by(revenue_stream_id: @fm_sub_stream.id).update!(value: 50)
      @film.film_revenue_percentages.where.not(revenue_stream_id: @fm_sub_stream.id).first.update!(value: 25)
      expect(@film.fm_subscription_only?).to eq(false)
    end

    it 'returns false when all values are zero' do
      expect(@film.fm_subscription_only?).to eq(false)
    end
  end

end
