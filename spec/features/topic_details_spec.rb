require 'rails_helper'
require 'support/features_helper'

describe 'topic_details', type: :feature do

  before(:each) do
    create(:setting)
    @topic = create(:topic)
  end

  it 'is gated' do
    visit topic_path(@topic)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the topic' do
    visit topic_path(@topic, as: $admin_user)
    expect(find('input[data-field="name"]').value).to eq('Latino')
  end

  it 'updates information about the topic' do
    visit topic_path(@topic, as: $admin_user)
    new_info = {
      name: 'LGBT'
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component(
      entity: @topic,
      data: new_info
    )
  end

  it 'validates information about the topic' do
    visit topic_path(@topic, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content("Name can't be blank")
  end

  it 'deletes the topic' do
    visit topic_path(@topic, as: $admin_user)
    delete_button = find('.delete-button')
    delete_button.click
    within('.confirm-delete') do
      find('.red-button').click
    end
    expect(page).to have_current_path('/settings', ignore_query: true)
    expect(Topic.find_by_id(@topic.id)).to be(nil)
  end

end
