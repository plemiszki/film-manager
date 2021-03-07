class AddContractualObligations < ActiveRecord::Migration[5.2]
  def change
    add_column :films, :contractual_obligations, :string, default: ""
  end
end
