def permissions(name=None):
    def wrap(function):
        def wrapper(*args):
            user = args[0]
            channel = args[1]
            permissions = user.permissions_in(channel)
            permission_dict = {
                "kick": permissions.kick_members,
                "ban": permissions.ban_members,
            }
            try:
                if permission_dict[name]:
                    return function(*args)
                else:
                    return False
            except KeyError:
                return function(*args)


        return wrapper
    return wrap