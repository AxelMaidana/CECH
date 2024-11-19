const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.createUserWithoutSignIn = functions.https.onCall(async (data: { email: any; password: any; name: any; lastname: any; role: any; additionalData: any; }, context: { auth: any; }) => {
  // Asegúrate de que la solicitud proviene de un usuario autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "La solicitud debe estar autenticada."
    );
  }

  const { email, password, name, lastname, role, additionalData } = data;

  try {
    // Crea el usuario
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // Guarda información adicional en Firestore
    const userData = {
      name,
      lastname,
      email,
      role,
      ...additionalData,
    };

    await admin.firestore().collection("users").doc(userRecord.uid).set(userData);

    return { uid: userRecord.uid, message: "Usuario creado exitosamente." };
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error al crear el usuario.",
      error
    );
  }
});
