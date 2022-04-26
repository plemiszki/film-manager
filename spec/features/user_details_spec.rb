require 'rails_helper'
require 'support/features_helper'

describe 'user_details', type: :feature do

  before :each do
    @user = create(:normal_user)
  end

  it 'is gated' do
    visit user_path($admin_user)
    expect(page).to have_content 'Please sign in to continue.'
  end

  it 'displays information about the user' do
    visit user_path($admin_user, as: $admin_user)
    expect(page).to have_no_css('.spinner')
    expect(page).to have_content 'User Details'
    expect(find('input[data-field="name"]').value).to eq 'Peter Lemiszki'
    expect(find('input[data-field="email"]').value).to eq 'peter+features@filmmovement.com'
    expect(find('input[data-field="title"]').value).to eq 'Software Engineer'
    expect(find('textarea[data-field="emailSignature"]').value).to eq "Peter Lemiszki\nFILM MOVEMENT\n237 West 35th Street, Suite 303\nNew York, NY 10001\nP: 212.941.7645 x206\nF: 212.941.7812\nFilmmovement.com"
    expect(find('input[data-field="access"]').value).to eq 'super_admin'
  end

  it 'updates information about the user' do
    visit user_path(@user, as: $admin_user)
    new_info = {
      name: 'Johnny Mo',
      email: 'johnny@filmmovement.com',
      title: 'Jabroni',
      email_signature: "Johnny Mo\nFILM MOVEMENT\n237 West 35th Street, Suite 303\nNew York, NY 10001\nP: 212.941.7645 x206\nF: 212.941.7812\nFilmmovement.com"
    }
    fill_out_form(new_info)
    save_and_wait
    verify_db_and_component(
      entity: @user,
      data: new_info
    )
  end

  it 'validates information about the user' do
    visit user_path(@user, as: $admin_user)
    clear_form
    save_and_wait
    expect(page).to have_content("Name can't be blank")
    expect(page).to have_content("Email is invalid")
  end

  it 'deletes the user, if admin' do
    visit user_path(@user, as: $admin_user)
    delete_button = find('.delete-button')
    delete_button.click
    within('.confirm-delete') do
      find('.red-button').click
    end
    expect(page).to have_current_path('/users', ignore_query: true)
    expect(User.find_by_id(@user.id)).to be(nil)
  end

  it 'hides delete button, if not admin' do
    visit user_path(@user, as: @user)
    expect(page).to have_no_css('.delete-button')
  end

end
