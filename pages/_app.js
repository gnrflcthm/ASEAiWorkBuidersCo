import Head from "next/head";

import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/base.css";
import "@/styles/global.css";

import "firebase.config";

import EmptyLayout from "../layout/empty-layout";
import { ChakraProvider } from "@chakra-ui/react";

import Router from "next/router";

import "nprogress/nprogress.css";
import NProgress from "nprogress";

Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

export default function App({ Component, pageProps }) {
    const Layout = Component.Layout || EmptyLayout;
    return (
        <div className="app">
            <Head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
                />
                <title>ASEA iWork Builders Co.</title>
                <link rel="icon" href="/logo.png" />
            </Head>
            <ChakraProvider resetCSS={false}>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </ChakraProvider>
        </div>
    );
}
