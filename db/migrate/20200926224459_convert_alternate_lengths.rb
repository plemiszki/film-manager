class ConvertAlternateLengths < ActiveRecord::Migration[5.2]

  def change
    change_column :alternate_lengths, :length, :string
  end

end
