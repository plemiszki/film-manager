require 'rails_helper'
require 'sidekiq/testing'
require 'support/features_helper'

describe 'licensor_details', type: :feature do

  before do
    WebMock.disable!
  end

  before(:each) do
    @licensor = Licensor.create!(name: 'Visit Films', email: 'ryan@visitfilms.com', sage_id: 'VISIT')
    create(:label)
    create(:film, title: 'Some Film From This Licensor', licensor_id: @licensor.id)
  end

  it 'is gated' do
    visit licensor_path(@licensor)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the licensor' do
    visit licensor_path(@licensor, as: $admin_user)
    wait_for_ajax
    expect(page).to have_content 'Licensor Details'
    expect(find('input[data-field="name"]').value).to eq 'Visit Films'
    expect(find('input[data-field="email"]').value).to eq 'ryan@visitfilms.com'
    expect(find('input[data-field="sageId"]').value).to eq 'VISIT'
    expect(page).to have_content 'Some Film From This Licensor'
  end

  it 'updates information about the licensor' do
    visit licensor_path(@licensor, as: $admin_user)
    new_info = {
      name: 'New Name',
      email: 'newemail@visitfilms.com',
      address: "Visit Films\n1300 Main Street\nNew York, NY 10001",
      sage_id: 'VISIIIIT',
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component(
      entity: @licensor,
      data: new_info,
    )
  end

  it 'validates information about the licensor' do
    visit licensor_path(@licensor, as: $admin_user)
    fill_out_form({
      name: '',
      email: '',
      address: '',
      sage_id: '',
    })
    save_and_wait
    expect(page).to have_content("Name can't be blank")
  end

  it 'deletes the licensor' do
    visit licensor_path(@licensor, as: $admin_user)
    click_delete_and_confirm
    expect(page).to have_current_path('/licensors', ignore_query: true)
    expect(Licensor.find_by_id(@licensor.id)).to be(nil)
  end

  it 'starts the generate statements summary job' do
    visit licensor_path(@licensor, as: $admin_user)
    click_btn('Statements Summary')
    expect(page).to have_content('Generating Statements Summary')
  end

  it 'displays only emails associated with the licensor' do
    create(:email,
      email_type: 'statement',
      recipient: 'associated@example.com',
      status: :delivered,
      sent_at: Time.zone.parse('2025-06-15 10:30:00'),
      metadata: { 'licensor_id' => @licensor.id.to_s, 'quarter' => 1, 'year' => 2025 },
      sender: $admin_user,
    )
    create(:email,
      email_type: 'statement',
      recipient: 'unassociated@example.com',
      status: :delivered,
      sent_at: Time.zone.parse('2025-06-15 10:30:00'),
      metadata: { 'licensor_id' => '999', 'quarter' => 2, 'year' => 2025 },
      sender: $admin_user,
    )
    visit licensor_path(@licensor, as: $admin_user)
    wait_for_ajax
    expect(page).to have_content 'Statements - Q1 2025'
    expect(page).to have_content 'Peter Lemiszki'
    expect(page).to have_content 'associated@example.com'
    expect(page).to have_content '2025-06-15 10:30:00'
    expect(page).to have_content 'Delivered'
    expect(page).not_to have_content 'unassociated@example.com'
    expect(page).not_to have_content 'Statements - Q2 2025'
  end

  it 'sends email reports' do
    Sidekiq::Testing.inline!
    create(:user, email: 'michael@filmmovement.com', name: 'Michael Rosenberg')
    create(:revenue_stream, name: 'Theatrical', order: 0)
    film = Film.find_by(title: 'Some Film From This Licensor')
    create(:royalty_report, film_id: film.id, quarter: 1, year: 2024)
    create(:royalty_report, film_id: film.id, quarter: 3, year: 2024)
    create(:royalty_report, film_id: film.id, quarter: 1, year: 2025)
    create(:royalty_report, film_id: film.id, quarter: 2, year: 2025)
    allow(ENV).to receive(:[]).and_call_original
    allow(ENV).to receive(:[]).with('TEST_MODE').and_return(nil)
    allow(ENV).to receive(:[]).with('MAILGUN_KEY').and_return('test-key')
    mailgun_client = instance_double(Mailgun::Client)
    allow(Mailgun::Client).to receive(:new).and_return(mailgun_client)
    allow(mailgun_client).to receive(:send_message).and_return(
      double('response', body: { 'id' => "<#{SecureRandom.uuid}@filmmovement.com>" })
    )
    allow_any_instance_of(RoyaltyReport).to receive(:export) do |report, args|
      filepath = File.join(args[:directory], "#{report.film.title} - Q#{report.quarter} #{report.year}.pdf")
      FileUtils.touch(filepath)
      "#{report.film.title} - Q#{report.quarter} #{report.year}.pdf"
    end
    visit licensor_path(@licensor, as: $admin_user)
    wait_for_ajax
    click_btn('Email Reports')
    expect(page).to have_content 'Send reports to this email address?'
    expect(page).to have_content 'ryan@visitfilms.com'
    # verify year buttons are present
    expect(page).to have_button '2025'
    expect(page).to have_button '2024'
    # verify quarter buttons are present
    expect(page).to have_button 'Q1'
    expect(page).to have_button 'Q2'
    expect(page).to have_button 'Q3'
    expect(page).to have_button 'Q4'
    # select year 2024 and Q3
    click_button '2024'
    click_button 'Q3'
    click_btn('Send')
    expect(page).to have_content 'Done!'
    click_btn('OK')
    wait_for_ajax
    expect(page).to have_content 'ryan@visitfilms.com'
    expect(page).to have_content 'Pending'
    expect(page).to have_content 'Statements - Q3 2024'
  end

end
