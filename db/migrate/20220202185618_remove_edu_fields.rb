class RemoveEduFields < ActiveRecord::Migration[6.1]

  def change
    remove_column :films, :msrp_post_street
    remove_column :films, :msrp_post_street_member
  end

end
