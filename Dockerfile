# https://github.com/meteorhacks/meteord
#FROM meteorhacks/meteord:onbuild

# https://github.com/chriswessels/meteor-tupperware
FROM quay.io/chriswessels/meteor-tupperware

# The maintainer of your app image
MAINTAINER Dominique Quatravaux <dominique.quatravaux@epfl.ch>

# (optional) Bake runtime options into your image
# ENV MONGO_URL="mongodb://url" MONGO_OPLOG_URL="mongodb://oplog_url" ROOT_URL="http://yourapp.com"
