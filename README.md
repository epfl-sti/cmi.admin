# Business databases of CMi

## Getting Started

Assuming you already have [Meteor installed](https://www.meteor.com/install):

1. `git clone --recursive https://github.com/epfl-sti/cmi.admin.git`
2. `meteor npm install`
3. Copy and modify `meteor-settings.json.sample` to indicate point to the
Kafka service (through the ZooKeeper IP and port)
4. `meteor run --settings meteor-settings.json`

## Developer Conventions

[Meteor](https://www.meteor.com/) is a really free-form framework. We
do have a few project-specific conventions, which make it easier to
build new functionality into it.

### Widget Names

**Widgets** are pieces of the UI (with their assorted model and
controller functionality) which can be re-used on multiple pages.
Their names look like `User$Pick`, where the part after $ has the role
of a method name (Pick, EditAll, EditFoo where Foo depends on the
access level etc.)
