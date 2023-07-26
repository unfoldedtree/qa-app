import { createRouter, createWebHistory } from 'vue-router'
import RootView from '../views/RootView.vue'
import LoginView from "../views/LoginView.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'root',
      meta: {
        requiresAuth: true
      },
      component: RootView,
      children: [
        {
          path: '',
          name: 'dashboard',
          meta: {
            title: 'Welcome Aboard!'
          },
          component: () => import('../views/dashboard/HomeView.vue'),
        },
        {
          path: 'organization',
          name: 'organization',
          redirect: '/',
          children: [
            {
              path: 'list',
              meta: {
                roleLevel: 15,
                title: 'Organization List',
                description: 'Use this one to fetch and filter organizations to view more information about them, including their parent and child relationships.'
              },
              name: 'organization_list',
              component: () => import('../views/organization/ListView.vue'),
            }
          ]
        },
        {
          path: 'business',
          name: 'business',
          redirect: '/',
          children: [
            {
              path: 'list',
              meta: {
                title: 'Business List',
                description: 'Use this one to fetch and filter businesses to view more information about them.',
              },
              name: 'business_list',
              component: () => import('../views/business/ListView.vue'),
            },
            {
              path: 'reset',
              meta: {
                roleLevel: 15,
                title: 'Reset Business To CT',
                description: 'Use this to reset a business to Call Transparency and set Self Service to false.',
              },
              name: 'business_reset',
              component: () => import('../views/business/ResetView.vue'),
            }
          ]
        },
        {
          path: 'users',
          name: 'users',
          redirect: '/',
          children: [
            {
              path: 'notification-wizard',
              name: 'notification_wizard',
              meta: {
                title: 'Notification Wizard',
                description: "Use this to send mass notifications to users user the associated entities.",
                roleLevel: 15
              },
              component: () => import('../views/users/NotificationWizardView.vue'),
            },
          ]
        },
        {
          path: 'phone-numbers',
          name: 'phone_numbers',
          redirect: '/',
          children: [
            {
              path: 'verify',
              name: 'phone_numbers_verify',
              meta: {
                title: 'Verify Phone Numbers',
                description: 'Upload a CSV file of phone numbers. Then, depending on the ids added in the form, we will try to fetch them from the exchange and show you how they match up with the results.'
              },
              component: () => import('../views/phonenumbers/VerifyView.vue'),
            },
            {
              path: 'generate',
              name: 'phone_numbers_generate',
              meta: {
                title: 'Generate Phone Numbers',
                description: 'Just put in your starting phone number and how many consecutive numbers you need. Then, we\'ll provide you with a downloadable CSV!'
              },
              component: () => import('../views/phonenumbers/GeneratorView.vue'),
            },
            {
              path: 'details',
              meta: {
                roleLevel: 15,
                title: 'Phone Number Details',
                description: 'Upload a CSV file of phone numbers and we will try to fetch them from the exchange and present all of the relevant information about them.'
              },
              name: 'phone_numbers_details',
              component: () => import('../views/phonenumbers/DetailsView.vue'),
            }
          ]
        },
        {
          path: 'fast-track',
          name: 'fast_track',
          redirect: '/',
          children: [
            {
              path: 'details',
              meta: {
                title: 'Fast Track Details',
                description: 'Use this one to fetch and filter businesses to view more information about them. Once they are clicked you can view information about their fast track submissions and if they have any rejections.',
              },
              name: 'fast_track_details',
              component: () => import('../views/fasttrack/DetailsView.vue'),
            }
          ]
        }
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/about',
      meta: {
        requiresAuth: true
      },
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

router.beforeEach((to, from, next) => {
  const apiKey = localStorage.getItem("apiKey");
  const token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");
  let parsedToken = null;

  if (token) {
    parsedToken = parseJwt(token);
    console.log("Token: ", parsedToken);
  }

  if (to!.meta!.requiresAuth) {
    if (!parsedToken || !apiKey || !refreshToken) {
      localStorage.clear();
      next({ name: "login" });
      return;
    }

    if (to!.meta!.roleLevel) {
      if (to!.meta.roleLevel > parsedToken.role) {
        // TODO - Throw toast error here.
        // alert("You don't have access to that page!")
        return;
      }
    }
  }

  if (to.name === "login" && token) {
    next({ name: "about" })
    return;
  }

  next()
})

function parseJwt (token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

export default router
