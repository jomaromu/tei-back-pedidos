import { Router, Request, Response } from "express";
import { verificaToken } from "../auth/auth";

import { PedidosClass } from "../class/pedidosClass";
import { BitacoraClass } from "../class/bitacoraClass";

const pedidoRouter = Router();

pedidoRouter.post(
  "/crearPedido",
  [verificaToken],
  (req: Request, resp: Response) => {
    const crearPedido = new PedidosClass();
    crearPedido.crearPedido(req, resp);
  }
);

pedidoRouter.put(
  "/editarPedido",
  [verificaToken],
  (req: Request, resp: Response) => {
    // Pendiente  auth editarPedido

    const editarPedido = new PedidosClass();
    editarPedido.editarPedido(req, resp);
  }
);

pedidoRouter.get(
  "/obtenerPedidoID",
  [verificaToken],
  (req: Request, resp: Response) => {
    const obtenerPedidoID = new PedidosClass();
    obtenerPedidoID.obtenerPedidoID(req, resp);
  }
);

pedidoRouter.delete(
  "/eliminarPedidoID",
  [verificaToken],
  (req: Request, resp: Response) => {
    const eliminarPedidoID = new PedidosClass();
    eliminarPedidoID.eliminarPedidoID(req, resp);
  }
);

pedidoRouter.get(
  "/obtenerPedidosPorRole",
  [verificaToken],
  (req: Request, resp: Response) => {
    const obtenerPedidosPorRole = new PedidosClass();
    obtenerPedidosPorRole.obtenerPedidosPorRole(req, resp);
  }
);

pedidoRouter.get(
  "/obtenerPorBusqueda",
  [verificaToken],
  (req: Request, resp: Response) => {
    const obtenerPorBusqueda = new PedidosClass();
    obtenerPorBusqueda.obtenerPorBusqueda(req, resp);
  }
);

pedidoRouter.get(
  "/entregadoPorEntregar",
  [verificaToken],
  (req: Request, resp: Response) => {
    const entregadoPorEntregar = new PedidosClass();
    entregadoPorEntregar.entregadoPorEntregar(req, resp);
  }
);

pedidoRouter.get(
  "/porEntregar",
  [verificaToken],
  (req: Request, resp: Response) => {
    const porEntregar = new PedidosClass();
    porEntregar.porEntregar(req, resp);
  }
);

pedidoRouter.get(
  "/obtenerBitacoraPorPedido",
  // [verificaToken],
  (req: Request, resp: Response) => {
    const obtenerBitacoraPorPedido = new BitacoraClass();
    obtenerBitacoraPorPedido.obtenerBitacoraPorPedido(req, resp);
  }
);

// pedidoRouter.get('/obtenerPedidosCriterio', [verificaToken], (req: Request, resp: Response) => {

//     const obtenerPedidosCriterio = new PedidosClass();
//     obtenerPedidosCriterio.obtenerPedidosCriterio(req, resp);
// });

pedidoRouter.get(
  "/obtenerTodos",
  [verificaToken],
  (req: Request, resp: Response) => {
    const obtenerTodos = new PedidosClass();
    obtenerTodos.obtenerTodos(req, resp);
  }
);

pedidoRouter.get(
  "/redireccionBandejas",
  [verificaToken],
  (req: Request, resp: Response) => {
    const redireccionBandejas = new PedidosClass();
    redireccionBandejas.redireccionBandejas(req, resp);
  }
);

pedidoRouter.get(
  "/busquedaBandeja",
  [verificaToken],
  (req: Request, resp: Response) => {
    const busquedaBandeja = new PedidosClass();
    busquedaBandeja.busquedaBandeja(req, resp);
  }
);

export default pedidoRouter;
