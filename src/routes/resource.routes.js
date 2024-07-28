const express = require("express");
const upload = require("../middlewares/multer.middleware.js");
const {
  createResource,
  getResources,
  getResource,
  deleteResource,
  updateResource,
  assignResource,
  makePayment,
  getSession,
} = require("../controllers/resources.controllers.js");

const router = express.Router();

router.post(
  "/create",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "videos", maxCount: 10 },
    { name: "pdf", maxCount: 1 },
  ]),
  createResource
);
router.get("/all", getResources);
router.get("/:id/show", getResource);
router.delete("/:id/delete", deleteResource);
router.put("/:id/update", updateResource);
router.post("/assign", assignResource);
router.post("/payment", makePayment);
router.get("/session/:id", getSession);

// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     const sig = req.headers["stripe-signature"];

//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         sig,
//         process.env.STRIPE_WEBHOOK_SECRET
//       );
//     } catch (err) {
//       res.status(400).send(`Webhook Error: ${err.message}`);
//       return;
//     }

//     // Handle the event
//     switch (event.type) {
//       case "payment_intent.succeeded":
//         const paymentIntent = event.data.object;
//         await Payment.query()
//           .findOne({ paymentIntentId: paymentIntent.id })
//           .patch({ status: "completed" });

//         // Assign the resource to the user
//         const { userId, resourceId } = paymentIntent.metadata;
//         await UserResource.query().insert({
//           userId,
//           resourceId,
//           isAssigned: true,
//           isBuyer: true,
//         });
//         break;
//       case "payment_intent.payment_failed":
//         const paymentFailed = event.data.object;
//         await Payment.query()
//           .findOne({ paymentIntentId: paymentFailed.id })
//           .patch({ status: "failed" });
//         break;
//       default:
//         console.log(`Unhandled event type ${event.type}`);
//     }

//     res.send({ received: true });
//   }
// );

module.exports = router;
