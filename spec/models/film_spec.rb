require 'rails_helper'
require 'support/controllers_helper'

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

end