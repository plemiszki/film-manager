class LanguageCode < ActiveRecord::Migration[7.0]
  def change
    add_column :languages, :prime_code, :string, default: ""
  end
end
