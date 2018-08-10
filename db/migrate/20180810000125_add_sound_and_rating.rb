class AddSoundAndRating < ActiveRecord::Migration
  def change
    add_column :films, :rating, :text, default: ""
    add_column :films, :sound_config, :text, default: ""
  end
end
