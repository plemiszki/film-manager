class AddSoundAndRating < ActiveRecord::Migration[5.2]
  def change
    add_column :films, :rating, :text, default: ""
    add_column :films, :sound_config, :text, default: ""
  end
end
