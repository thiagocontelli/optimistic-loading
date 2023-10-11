type User = {
  id: string,
  firstName: string,
  lastName: string,
  age: number,
  email: string,
  phone: string,
  gender: string
}

const users: User[] = [];

async function delay(timeInMs: number = 2000) {
  await new Promise(resolve => setTimeout(resolve, timeInMs))
}

async function getUsers() {
  console.log('getUsers: start')

  await delay(3500)

  if (Math.random() > 0.8) {
    console.log('getUsers: error')

    throw new Error()
  }

  console.log('getUsers: finish')

  return users
}

async function addUser(newUser: User) {
  console.log('addUser: start')

  await delay()

  if (Math.random() > 0.8) {
    console.log('addUser: error')

    throw new Error
  }

  console.log('addUser: finish')

  users.unshift(newUser)

  return newUser
}

export {
  addUser, delay, getUsers, type User
};

