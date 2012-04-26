class PodcastsController < ApplicationController
  def show
    @podcast = Err.new(params[:id])
    render 'err.erb.xml'
  end
end