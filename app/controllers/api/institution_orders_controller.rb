class Api::InstitutionOrdersController < AdminController

  def index
    @institution_orders = InstitutionOrder.all.includes(:institution)
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  def new
    @institutions = Institution.all
    render 'new', formats: [:json], handlers: [:jbuilder]
  end

  def show
    @institution_order = InstitutionOrder.find(params[:id])
    @customer_email = @institution_order.customer.email
    @invoice = @institution_order.invoice
    @institutions = Institution.all
    @institution_order_films = @institution_order.institution_order_films.includes(:film)
    @institution_order_formats = @institution_order.institution_order_formats.includes(:format)
    @films = Film.where.not(id: @institution_order_films.pluck(:film_id))
    @formats = Format.where.not(id: @institution_order_formats.pluck(:format_id))
    render 'show', formats: [:json], handlers: [:jbuilder]
  end

  def create
    @institution_order = InstitutionOrder.new(institution_order_params)
    if @institution_order.save
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@institution_order)
    end
  end

  def update
    @institution_order = InstitutionOrder.find(params[:id])
    if @institution_order.update(institution_order_params.merge({
      billing_address_1: institution_order_params[:billing_address1],
      billing_address_2: institution_order_params[:billing_address2],
      shipping_address_1: institution_order_params[:shipping_address1],
      shipping_address_2: institution_order_params[:shipping_address2],
    }).except(:billing_address1, :billing_address2, :shipping_address1, :shipping_address2))
      @customer_email = @institution_order.customer.email
      render 'show', formats: [:json], handlers: [:jbuilder]
    else
      render_errors(@institution_order)
    end
  end

  def destroy
    @institution_order = InstitutionOrder.find(params[:id])
    if @institution_order.destroy
      render json: @institution_order, status: 200
    else
      render_errors(@institution_order)
    end
  end

  def send_invoice
    institution_order = InstitutionOrder.includes(institution_order_films: [:film]).find(params[:id])
    new_invoice_data = {
      invoice_type: 'institution',
      sent_date: Date.today,
      number: "#{Setting.first.next_institution_invoice_number}E",
      num: Setting.first.next_institution_invoice_number,
      billing_name: institution_order.billing_name,
      billing_address1: institution_order.billing_address_1,
      billing_address2: institution_order.billing_address_2,
      billing_city: institution_order.billing_city,
      billing_state: institution_order.billing_state,
      billing_zip: institution_order.billing_zip,
      billing_country: institution_order.billing_country,
      shipping_name: institution_order.shipping_name,
      shipping_address1: institution_order.shipping_address_1,
      shipping_address2: institution_order.shipping_address_2,
      shipping_city: institution_order.shipping_city,
      shipping_state: institution_order.shipping_state,
      shipping_zip: institution_order.shipping_zip,
      shipping_country: institution_order.shipping_country,
      total: institution_order.price + institution_order.shipping_fee,
      institution_id: institution_order.institution_id,
      institution_order_id: institution_order.id,
      po_number: institution_order.number,
    }
    invoice = Invoice.create!(new_invoice_data)
    description_lines = institution_order.films.pluck(:title)
    description_lines << "\n"
    description_lines << institution_order.licensed_rights_display_text
    description_lines << "\n"
    description_lines << "Formats: #{institution_order.formats.pluck(:name).join(", ")}"
    InvoiceRow.create!(
      invoice: invoice,
      item_label: description_lines.join("\n"),
      item_qty: 1,
      total_price: institution_order.price,
    )
    unless institution_order.shipping_fee.zero?
      InvoiceRow.create!(
        invoice: invoice,
        item_label: "Shipping Fee",
        item_qty: 1,
        total_price: institution_order.shipping_fee,
      )
    end
    time_started = Time.now.to_s
    job = Job.create!(job_id: time_started, name: "send institution invoice", first_line: "Sending Invoice", second_line: false)
    SendInstitutionInvoice.perform_async(0, {
      time_started: time_started,
      invoice_id: invoice.id,
      user_id: current_user.id,
      email: institution_order.customer.email,
    }.stringify_keys)
    render json: { job: job.render_json }
  end

  private

  def institution_order_params
    params[:institution_order].permit(
      :institution_id,
      :number,
      :order_date,
      :billing_name,
      :billing_address1,
      :billing_address2,
      :billing_city,
      :billing_state,
      :billing_zip,
      :billing_country,
      :shipping_name,
      :shipping_address1,
      :shipping_address2,
      :shipping_city,
      :shipping_state,
      :shipping_zip,
      :shipping_country,
      :licensed_rights,
      :price,
      :shipping_fee,
      :materials_sent,
      :tracking_number,
      :notes,
    )
  end

end
