module RenderErrors

  def render_errors(entity)
    render json: { errors: entity.errors.as_json(full_messages: true) }, status: 422
  end

end
