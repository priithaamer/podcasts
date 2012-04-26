class PodcastsController < ActionController::Base
  def show
    @podcast = Podcast.new(params[:id])
    render 'show.erb.xml'
  end
end